import axios from "axios";
import Landmark from "../models/Landmark.js";
import userLocationSchema from "../models/userLocationSchema.js";
import WeatherEntry from "../models/WeatherEntry.js";

// ✅ CREATE operation - fetch & store weather data
export const createWeatherEntry = async (req, res) => {
  console.log("📩 Incoming request body:", req.body);

  const { userId, locationType, locationValue } = req.body; // <-- userId is required

  if (!userId || !locationType || !locationValue) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // --- Resolve coordinates ---
    let lat, lon;
    console.log("🌐 Resolving coordinates for", locationType, locationValue);

    if (locationType === "GPS Coordinates") {
      const [gpsLat, gpsLon] = locationValue.split(",").map(v => parseFloat(v.trim()));
      if (isNaN(gpsLat) || isNaN(gpsLon)) {
        return res.status(400).json({ message: "Invalid GPS coordinates" });
      }
      lat = gpsLat;
      lon = gpsLon;

    } else if (locationType === "Landmarks") {
      const landmark = await Landmark.findOne({ name: new RegExp(`^${locationValue}$`, "i") });
      if (!landmark) return res.status(404).json({ message: "Landmark not found" });
      lat = landmark.latitude;
      lon = landmark.longitude;

    } else if (locationType === "Zip Code/Postal Code") {
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(locationValue)}&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      if (!geoRes.data) return res.status(404).json({ message: "Location not found" });
      lat = geoRes.data.lat;
      lon = geoRes.data.lon;

    } else { // City or Town
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationValue)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      if (!geoRes.data || !geoRes.data.length) {
        return res.status(404).json({ message: "Location not found" });
      }
      lat = geoRes.data[0].lat;
      lon = geoRes.data[0].lon;
    }

    // --- Fetch 5-day forecast (3-hour intervals) ---
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    // --- Map & store in WeatherEntry ---
    const formattedWeather = weatherRes.data.list.map(f => ({
      location: locationValue,
      date: new Date(f.dt * 1000),
      weatherDescription: f.weather[0].description,
      temperature: Math.round(f.main.temp),
      feelsLike: Math.round(f.main.feels_like),
      humidity: f.main.humidity,
      pressure: f.main.pressure,
      windSpeed: f.wind.speed,
      windDeg: f.wind.deg,
      clouds: f.clouds.all,
      rain: f.rain?.["3h"] || 0,
      weatherIcon: `https://openweathermap.org/img/wn/${f.weather[0].icon}.png`,
    }));

    // Insert many forecast entries
    const savedEntries = await WeatherEntry.insertMany(formattedWeather);

    // --- Update UserLocation collection ---
    const existingLocation = await userLocationSchema.findOne({ userId, latitude: lat, longitude: lon });

    if (existingLocation) {
      // Increment frequency & update lastVisited
      existingLocation.frequency += 1;
      existingLocation.lastVisited = new Date();
      await existingLocation.save();
    } else {
      // Create new document
      await userLocationSchema.create({
        userId,
        latitude: lat,
        longitude: lon,
        frequency: 1,
        lastVisited: new Date()
      });
    }

    // --- Group by day for frontend ---
    const grouped = savedEntries.reduce((acc, entry) => {
      const dayKey = entry.date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(entry);
      return acc;
    }, {});

    res.status(201).json({
      message: "Weather data saved successfully.",
      weather: grouped
    });

  } catch (err) {
    console.error("❌ Weather API error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch weather data" });
  }
};

// ✅ READ operation - fetch all weather entries
export const getAllWeatherEntries = async (req, res) => {
  try {
    const entries = await WeatherEntry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error("❌ Error fetching weather entries:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching weather entries"
    });
  }
};
// ✅ UPDATE weather entry (location & date only, then fetch updated list)
export const updateWeatherEntry = async (req, res) => {
  try {
    const { location, date } = req.body;

    // update specific entry
    const updatedEntry = await WeatherEntry.findByIdAndUpdate(
      req.params.id,
      { location, date },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Weather entry not found" });
    }

    // ✅ fetch all entries again after update
    const allEntries = await WeatherEntry.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "✅ Weather entry updated successfully",
      updatedEntry,
      allEntries, // return refreshed list for frontend
    });
  } catch (error) {
    console.error("❌ Error updating weather entry:", error);
    res.status(500).json({
      message: "Server error while updating weather entry",
      error,
    });
  }
};
// DELETE /api/weather/delete/:id
export const deleteWeatherEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID is required" });

    const deleted = await WeatherEntry.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Entry not found" });

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};


// ✅ CURRENT WEATHER + 5-DAY FORECAST operation
export const getWeatherByCoords = async (req, res) => {
  console.log("📩 Incoming request body (weather+forecast):", req.body);

  const { userId, lat, lon } = req.body;

  if (!userId || !lat || !lon) {
    console.warn("⚠️ Missing required fields:", { userId, lat, lon });
    return res.status(400).json({ message: "Missing required fields (userId, lat, lon)" });
  }

  try {
    // --- Reverse geocode for location name ---
    let resolvedLocation = "";
    try {
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
      );

      if (geoRes.data && geoRes.data.length > 0) {
        const place = geoRes.data[0];
        const nameParts = [place.name, place.state, place.country].filter(Boolean);
        resolvedLocation = nameParts.join(", ");
      } else {
        resolvedLocation = "Unknown Location";
      }
    } catch (geoErr) {
      console.warn("⚠️ Reverse geocoding failed:", geoErr.message);
      resolvedLocation = "Unknown Location";
    }

    // --- Fetch current weather ---
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const w = weatherRes.data;

    // --- Fetch 5-day / 3-hour forecast ---
    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const forecast = forecastRes.data.list || [];

    // --- Save current snapshot in DB ---
    const weatherEntry = await WeatherEntry.create({
      location: resolvedLocation || w.name || "Unknown",
      date: new Date(w.dt * 1000),
      weatherDescription: w.weather?.[0]?.description || "N/A",
      temperature: Math.round(w.main?.temp),
      feelsLike: Math.round(w.main?.feels_like),
      humidity: w.main?.humidity,
      pressure: w.main?.pressure,
      windSpeed: w.wind?.speed,
      windDeg: w.wind?.deg,
      clouds: w.clouds?.all,
      rain: w.rain?.["1h"] || 0,
      weatherIcon: `https://openweathermap.org/img/wn/${w.weather?.[0]?.icon}.png`,
    });

    // --- Update UserLocation ---
    const existingLocation = await userLocationSchema.findOne({ userId, latitude: lat, longitude: lon });
    if (existingLocation) {
      existingLocation.frequency += 1;
      existingLocation.lastVisited = new Date();
      await existingLocation.save();
    } else {
      await userLocationSchema.create({
        userId,
        latitude: lat,
        longitude: lon,
        frequency: 1,
        lastVisited: new Date()
      });
    }

    // --- Build response ---
    const responsePayload = {
      message: "Weather + forecast data fetched successfully.",
      location: resolvedLocation,
      current: weatherEntry,
      forecast: forecast.map((f) => ({
        date: f.dt_txt,
        temp: Math.round(f.main.temp),
        feelsLike: Math.round(f.main.feels_like),
        weather: f.weather?.[0]?.description || "N/A",
        icon: `https://openweathermap.org/img/wn/${f.weather?.[0]?.icon}.png`,
        humidity: f.main.humidity,
        pressure: f.main.pressure,
        windSpeed: f.wind.speed,
        windDeg: f.wind.deg,
        clouds: f.clouds.all,
        rain: f.rain?.["3h"] || 0,
      })),
    };

    console.log("📤 Sending response to frontend:", JSON.stringify(responsePayload, null, 2));
    res.status(200).json(responsePayload);

  } catch (err) {
    console.error("❌ Weather/Forecast API error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch weather/forecast data" });
  }
};










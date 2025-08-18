import axios from "axios";
import { exec } from "child_process";
import dotenv from "dotenv";
import userLocationSchema from "../models/userLocationSchema.js";

dotenv.config();

// Helper: Get weather for a location from OpenWeatherMap
const getWeatherForLocation = async (location) => {
  try {
    console.log(`[Weather] Fetching coordinates for: ${location}`);
    const geoRes = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        location
      )}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    if (!geoRes.data[0]) return null;

    const { lat, lon } = geoRes.data[0];
    console.log(`[Weather] Fetching current weather for ${location} (lat: ${lat}, lon: ${lon})`);

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    return {
      location,
      temp: weatherRes.data.main.temp,
      condition: weatherRes.data.weather[0].description,
      feels_like: weatherRes.data.main.feels_like,
      humidity: weatherRes.data.main.humidity,
      wind: weatherRes.data.wind.speed,
    };
  } catch (err) {
    console.error(`[Weather] Error fetching weather for ${location}:`, err.message);
    return null;
  }
};

// Controller: Generate daily alerts using local Python LLM
export const getDailyAlerts = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`[DailyAlerts] Generating daily alerts for user: ${userId}`);

    // 1️⃣ Recent + frequent locations
    const recentLocations = await userLocationSchema
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    const topLocationsAgg = await userLocationSchema.aggregate([
      { $group: { _id: "$locationName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 2 },
    ]);

    const locationsToCheck = [
      ...recentLocations.map((l) => l.locationName),
      ...topLocationsAgg.map((l) => l._id),
    ];
    const uniqueLocations = [...new Set(locationsToCheck)];

    if (!uniqueLocations.length)
      return res.status(200).json({ alerts: [], message: "No locations found" });

    // 2️⃣ Fetch weather for each location
    const weatherDataList = [];
    for (const loc of uniqueLocations) {
      const weather = await getWeatherForLocation(loc);
      if (weather) weatherDataList.push(weather);
    }

    if (!weatherDataList.length)
      return res.status(200).json({ alerts: [], message: "No weather data found" });

    // 3️⃣ Call Python script for generating alerts
    const weatherJSON = JSON.stringify(weatherDataList);
    console.log("[DailyAlerts] Sending weather data to local LLM...");

    exec(
      `python generate_script.py '${weatherJSON}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("[DailyAlerts] Python error:", error.message);
          return res.status(500).json({ message: "Error generating alerts" });
        }

        let generatedAlerts = [];
        try {
          generatedAlerts = JSON.parse(stdout);
        } catch (err) {
          console.warn("[DailyAlerts] Failed to parse JSON, returning raw text.");
          generatedAlerts = [{ raw_text: stdout }];
        }

        console.log("[DailyAlerts] Alerts generated successfully");
        res.status(200).json({ alerts: generatedAlerts });
      }
    );
  } catch (err) {
    console.error("[DailyAlerts] Error:", err.message);
    res.status(500).json({ message: "Server error generating daily alerts" });
  }
};

import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// --- Decode JWT manually ---
const parseJwt = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

// --- Group forecast entries by date ---
const groupForecastByDay = (entries) => {
  if (!Array.isArray(entries)) return {};
  return entries.reduce((acc, entry) => {
    const date = entry.date.split("T")[0]; // ISO date "2025-08-17"
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});
};

// --- Fetch forecast & save to DB ---
const fetchWeather = async (lat, lon, setWeatherData, setLoading, setLocationName) => {
  setLoading(true);
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.token) {
      alert("User not found. Please login again.");
      setLoading(false);
      return;
    }

    // Decode token manually
    const decoded = parseJwt(userData.token);
    const userId = decoded?.id || decoded?._id || userData._id;

    // ✅ Call backend forecast endpoint
    const res = await axios.post(
      "http://localhost:3000/api/weather/current-location",
      { userId, lat, lon },
      { headers: { Authorization: `Bearer ${userData.token}` } }
    );

    // ✅ Your backend sends back `forecast` array of entries
    const grouped = groupForecastByDay(res.data.forecast || []);
    setWeatherData(grouped);

    setLocationName(res.data.location || "Selected Location");
  } catch (err) {
    console.error("Failed to fetch weather data:", err.response?.data || err.message);
    alert("Failed to fetch weather data.");
  } finally {
    setLoading(false);
  }
};

// --- Map click handler ---
function LocationSelector({ position, setPosition, setWeatherData, setLoading, setLocationName }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      fetchWeather(lat, lng, setWeatherData, setLoading, setLocationName);
    },
  });

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        Selected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
      </Popup>
    </Marker>
  );
}

// --- Change map view ---
function ChangeView({ center, zoom }) {
  const map = useMap();
  if (center) map.setView(center, zoom);
  return null;
}

// --- Main component ---
export default function WorldMap() {
  const [position, setPosition] = useState(null);
  const [zoom, setZoom] = useState(2);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForecastPanel, setShowForecastPanel] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [locationName, setLocationName] = useState("Current Weather");

  const handleUseMyLocation = () => {
    if (loading) return;
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setZoom(10);
        fetchWeather(latitude, longitude, setWeatherData, setLoading, setLocationName);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  // --- Extract today's weather summary ---
  const getCurrentWeather = () => {
    if (!weatherData) return null;
    const today = Object.keys(weatherData)[0];
    if (!today) return null;
    return weatherData[today][0]; // first entry
  };

  const currentWeather = getCurrentWeather();

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer
        center={[20, 0]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => map.on("zoomend", () => setZoom(map.getZoom()))}
      >
        <ChangeView center={position || [20, 0]} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector
          position={position}
          setPosition={setPosition}
          setWeatherData={setWeatherData}
          setLoading={setLoading}
          setLocationName={setLocationName}
        />
      </MapContainer>

      {/* --- Current Weather Card --- */}
      {currentWeather && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 300,
            background: "rgba(255,255,255,0.98)",
            borderRadius: 20,
            padding: "18px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            fontFamily: "Segoe UI, sans-serif",
            zIndex: 9999,
            color: "black",
          }}
        >
          <h3 style={{ marginTop: 0 }}>{locationName}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={currentWeather.icon || "https://openweathermap.org/img/wn/01d.png"}
              alt="weather-icon"
              style={{ width: 60, height: 60 }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 16 }}>{currentWeather.weatherDescription}</p>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: 20 }}>
                🌡 {currentWeather.temp}°C
              </p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: "500" }}>
    {currentWeather.weather}
  </p>
            </div>
          </div>
          <p style={{ margin: "10px 0 0 0" }}>
            🌡️ Feels like: {currentWeather.feelsLike}°C <br />
            💨 {currentWeather.windSpeed} m/s | 💧 {currentWeather.humidity}% <br />
            ☁️ {currentWeather.clouds}% | 🌍 {currentWeather.pressure} hPa
          </p>

          {/* Enable forecast button */}
          <button
            onClick={() => setShowForecastPanel(true)}
            style={{
              marginTop: 12,
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "#446ebb",
              color: "white",
              cursor: "pointer",
            }}
          >
            See Full Forecast
          </button>
        </div>
      )}

      {/* --- Forecast Panel --- */}
      {showForecastPanel && weatherData && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(255,255,255,0.98)",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: "0 -6px 20px rgba(0,0,0,0.3)",
            padding: 20,
            maxHeight: "55vh",
            overflowY: "auto",
            zIndex: 9999,
            color: "black",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>5-Day Forecast</h3>
            <button
              onClick={() => {
                setShowForecastPanel(false);
                setSelectedDay(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "black",
              }}
            >
              ✖
            </button>
          </div>

          {!selectedDay ? (
            // --- Daily Summary Cards ---
            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {Object.entries(weatherData).map(([day, entries]) => {
                const avgTemp = (
                  entries.reduce((sum, e) => sum + e.temp, 0) / entries.length
                ).toFixed(1);
                const mainDesc = entries[0]?.weatherDescription;
                const icon =
                  entries[0]?.icon || "https://openweathermap.org/img/wn/01d.png";
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      minWidth: 150,
                      padding: 14,
                      borderRadius: 14,
                      background: "#cccc",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      textAlign: "center",
                    }}
                  >
                    <h4 style={{ margin: "4px 0" }}>{new Date(day).toDateString()}</h4>
                    <p>{new Date(day).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    <p style={{ margin: 0, fontSize: 14 }}>{entries[0]?.weather}</p>
                    <img src={icon} alt="weather-icon" style={{ width: 50, height: 50 }} />
                    <p style={{ margin: 0 }}>{mainDesc}</p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>🌡 {avgTemp}°C</p>
                    <p>{day.weather}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            // --- Full Forecast for Selected Day ---
            <div>
              <h4>{new Date(selectedDay).toDateString()}</h4>
              {weatherData[selectedDay].map((entry, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <img
                    src={entry.icon || "https://openweathermap.org/img/wn/01d.png"}
                    alt="weather-icon"
                    style={{ width: 40, height: 40 }}
                  />
                 <div>
  <strong>
    {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
  </strong>{" "}
  - {entry.weatherDescription}
  <br />
  🌡 Temperature {entry.temp}°C <br />
  🤗 Feels {entry.feelsLike}°C <br />
  💨 Wind speed {entry.windSpeed} m/s <br />
  💧 Humidity {entry.humidity}% <br />
  ☁️ Clouds {entry.clouds}% <br />
  🌍 Pressure {entry.pressure} hPa <br />
</div>

                </div>
              ))}
              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  marginTop: 14,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#446ebb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Back to Days
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Always Visible Button --- */}
      <button
        onClick={handleUseMyLocation}
        disabled={loading}
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#446ebb",
          color: "white",
          border: "none",
          borderRadius: 20,
          padding: "10px 20px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          zIndex: 9999,
        }}
      >
        {loading ? "Fetching Weather..." : "Use My Location"}
      </button>
    </div>
  );
}

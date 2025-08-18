import { useEffect, useState } from "react";

export default function ReadPanel({ onClose }) {
  const [weatherEntries, setWeatherEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchWeatherEntries = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/weather/all");
        const data = await response.json();

        if (response.ok && data.success) {
          setWeatherEntries(data.data);
        } else {
          setErrorMessage(data.message || "Failed to fetch entries.");
        }
      } catch (error) {
        console.error("❌ Error fetching weather entries:", error);
        setErrorMessage("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherEntries();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "95%",
        maxWidth: "1400px",
        padding: "30px",
        background: "#f9f9f9",
        borderRadius: "15px",
        overflowY: "auto",
        maxHeight: "90vh",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 15,
          right: 15,
          background: "transparent",
          border: "none",
          fontSize: 28,
          cursor: "pointer",
          color: "#000",
        }}
      >
        &times;
      </button>

      <h2 style={{ color: "#000", marginBottom: "1rem" }}>All Weather Entries</h2>

      {loading && <p>Loading entries...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Entries Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          color:"black"
        }}
      >
        {weatherEntries.map((entry) => (
          <div
            key={entry._id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
          <h3 style={{ color: "#446ebb", marginBottom: "10px" }}>
  {entry.location}
</h3>
<img
  src={entry.weatherIcon}
  alt={entry.weatherDescription}
  width={48}
  height={48}
  style={{ marginBottom: "10px" }}
/>
<p><strong>Date & Time:</strong> {new Date(entry.date).toLocaleString()}</p>
<p><strong>Temperature:</strong> {entry.temperature}°C</p>
<p><strong>Feels Like:</strong> {entry.feelsLike}°C</p>
<p><strong>Humidity:</strong> {entry.humidity}%</p>
<p><strong>Pressure:</strong> {entry.pressure} hPa</p>
<p><strong>Wind:</strong> {entry.windSpeed} m/s, {entry.windDeg}°</p>
<p><strong>Clouds:</strong> {entry.clouds}%</p>
<p><strong>Rain:</strong> {entry.rain ?? 0} mm</p>
<p><strong>Description:</strong> {entry.weatherDescription}</p>
<p style={{ fontSize: "0.8rem", color: "#777" }}>
  Saved at: {new Date(entry.createdAt).toLocaleString()}
</p>

          </div>
        ))}
      </div>
    </div>
  );
}

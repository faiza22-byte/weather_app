import { useState, useEffect } from "react";
import axios from "axios";

// ✅ Panel for updating entries
export function UpdatePanel({ entry, onClose, onUpdated }) {
  const [location, setLocation] = useState(entry.location || "");
  const [date, setDate] = useState(entry.date ? entry.date.slice(0, 10) : ""); 
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/weather/update/${entry._id}`, {
        location,
        date,
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Error updating entry:", err);
      setError("Update failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto", // ✅ allow scrolling if panel content is tall
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "90%", // ✅ take more width on large screens
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            float: "right",
            border: "none",
            background: "transparent",
            fontSize: "22px",
            cursor: "pointer",
            color: "black",
          }}
        >
          ✖
        </button>
        <h2 style={{color:"black"}}>Edit Weather Entry</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "15px" }}>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", marginTop: "5px", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", marginTop: "5px", padding: "8px" }}
          />
        </div>
        <button
          onClick={handleUpdate}
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default function WeatherDashboard({ onClose }) { 
  const [weatherEntries, setWeatherEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchWeatherEntries = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/weather/all");
      setWeatherEntries(res.data.data || res.data || []);
    } catch (err) {
      console.error("❌ Error fetching weather entries:", err);
    }
  };

  useEffect(() => {
    fetchWeatherEntries();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        background: "#f0f0f0",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Dashboard panel */}
      <div
        style={{
          width: "90%",
          maxWidth: "1000px",
          background: "#fff",
          borderRadius: "10px",
          padding: "20px 30px 40px 30px",
          position: "relative", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          marginTop: "20px", // start from top
        }}
      >
        {/* Cross button inside panel at top-right */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "26px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#333",
            zIndex: 1001,
          }}
        >
          ✖
        </button>

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Weather Dashboard</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {weatherEntries.map((entry) => (
            <div
              key={entry._id}
              style={{
                background: "white",
                border: "1px solid black",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                color: "black",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>
                {entry.location}
              </h3>
              <p>Date: {new Date(entry.date).toLocaleDateString()}</p>
              <p>Temp: {entry.temperature}°C</p>
              <p>Weather: {entry.weatherDescription}</p>
              <button
                onClick={() => setEditingEntry(entry)}
                style={{
                  marginTop: "10px",
                  background: "#007BFF",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>
          ))}

          {editingEntry && (
            <UpdatePanel
              entry={editingEntry}
              onClose={() => setEditingEntry(null)}
              onUpdated={fetchWeatherEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
}

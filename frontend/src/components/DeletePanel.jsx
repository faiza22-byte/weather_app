import { useState, useEffect } from "react";
import axios from "axios";

export default function DeletePanel({ onClose, onDeleted }) {
  const [weatherEntries, setWeatherEntries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all weather entries
  const fetchWeatherEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3000/api/weather/all");
      setWeatherEntries(res.data.data || res.data || []);
    } catch (err) {
      console.error("❌ Error fetching weather entries:", err.response?.data || err.message);
      setError("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherEntries();
  }, []);

  // Delete a weather entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/weather/delete/${id}`);
      fetchWeatherEntries(); // refresh list
      if (onDeleted) onDeleted(); // refresh parent dashboard if needed
    } catch (err) {
      console.error("❌ Error deleting entry:", err.response?.data || err.message);
      setError("Failed to delete entry");
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
        padding: "20px",
        overflowY: "auto",
        color: "black",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "black",
          }}
        >
          ✖
        </button>

        <h2 style={{ marginBottom: "20px" }}>Delete Weather Entries</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <p>Loading entries...</p>
        ) : weatherEntries.length === 0 ? (
          <p>No weather entries available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {weatherEntries.map((entry) => (
              <li
                key={entry._id}
                style={{
                  background: "#f9f9f9",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{entry.location}</strong> -{" "}
                  {new Date(entry.date).toLocaleDateString()} -{" "}
                  {entry.weatherDescription}
                </span>
                <button
                  onClick={() => handleDelete(entry._id)}
                  style={{
                    background: "#FF4C4C",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

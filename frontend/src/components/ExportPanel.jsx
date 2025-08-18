import axios from "axios";
import { useEffect, useState } from "react";

export default function ExportPanel({ onClose }) {
  const [weatherEntries, setWeatherEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [format, setFormat] = useState("json");
  const [error, setError] = useState(null);

  // Fetch all weather entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/export");
        setWeatherEntries(res.data.entries || []);
      } catch (err) {
        console.error("Failed to fetch weather entries:", err);
        setError("Failed to fetch entries");
      }
    };
    fetchEntries();
  }, []);

  // Toggle selection of entry
  const toggleSelect = (id) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Handle export
  const handleExport = async () => {
    if (selectedEntries.length === 0) {
      alert("Please select at least one entry to export.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/api/export`,
        {
          entryIds: selectedEntries,
          format,
        },
        { responseType: "blob" } // important for file download
      );

      // Create downloadable file
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weather_export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export entries:", err);
      setError("Failed to export entries");
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
        overflowY: "auto",
        padding: "20px",
        color: "black",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Cross button to close panel */}
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

        <h2 style={{ marginBottom: "20px" }}>Export Weather Entries</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {weatherEntries.length === 0 ? (
          <p>No weather entries available.</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
              {weatherEntries.map((entry) => (
                <li
                  key={entry._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEntries.includes(entry._id)}
                    onChange={() => toggleSelect(entry._id)}
                    style={{ marginRight: "10px" }}
                  />
                  <span>
                    <strong>{entry.location}</strong> -{" "}
                    {new Date(entry.date).toLocaleDateString()} -{" "}
                    {entry.weatherDescription}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginRight: "10px" }}>Export Format:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="md">Markdown</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              style={{
                padding: "10px 20px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Export Selected Entries
            </button>
          </>
        )}
      </div>
    </div>
  );
}

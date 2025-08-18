import { useState } from "react";

// Helper to decode JWT manually
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

export default function CreatePanel({ onClose }) {
  const [locationType, setLocationType] = useState("City");
  const [locationValue, setLocationValue] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [showFullForecast, setShowFullForecast] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const isValidLocation = () => locationValue.trim().length > 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage("");
    setWeatherData(null);
    setShowFullForecast(null);
    setSelectedCard(null);

    if (!isValidLocation()) {
      setFormMessage("Please enter a valid location (min 3 characters).");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.token) {
        setFormMessage("User not found. Please login again.");
        return;
      }

      // Decode token manually
      const decoded = parseJwt(userData.token);
      const userId = decoded?.id || userData._id;

      const response = await fetch("http://localhost:3000/api/weather/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationType,
          locationValue,
          userId
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormMessage("Data fetched successfully!");
        setWeatherData(data.weather || {});
        setLocationValue("");
      } else {
        setFormMessage(data.message || "Failed to fetch data.");
      }
    } catch (error) {
      setFormMessage("Error connecting to server.");
      console.error(error);
    }
  };

  const renderCard = (entry) => (
    <div
      onClick={() => setSelectedCard(entry)}
      style={{
        minWidth: "150px",
        background: "white",
        borderRadius: "10px",
        padding: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <img src={entry.weatherIcon} alt={entry.weatherDescription} width={48} height={48} />
      <p style={{ margin: "5px 0", fontWeight: "bold", color: "#446ebb" }}>{entry.temperature}°C</p>
      <p style={{ margin: "5px 0", color: "#555", fontSize: "0.8rem" }}>{entry.weatherDescription}</p>
    </div>
  );

  const getDailySummary = () => {
    if (!weatherData) return [];
    return Object.keys(weatherData).map((dayKey) => ({
      dayKey,
      entry: weatherData[dayKey][0],
    }));
  };

  return (
    <div style={{
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
    }}>
      {/* Close button */}
      <button onClick={onClose} style={{ position: "absolute", top: 15, right: 15, background: "transparent", border: "none", fontSize: 28, cursor: "pointer", color: "#000" }}>&times;</button>

      <h2 style={{ color: "#000", marginBottom: "1rem" }}>Weather Forecast</h2>

      {formMessage && (
        <p style={{ color: formMessage.includes("success") ? "green" : "red", marginBottom: "1rem" }}>
          {formMessage}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={locationType} onChange={(e) => setLocationType(e.target.value)} style={{ padding: "8px", minWidth: "180px" }}>
          <option value="Zip Code/Postal Code">Zip Code/Postal Code</option>
          <option value="GPS Coordinates">GPS Coordinates</option>
          <option value="Town">Town</option>
          <option value="City">City</option>
        </select>
        <input type="text" value={locationValue} onChange={(e) => setLocationValue(e.target.value)} placeholder="Enter location" style={{ padding: "8px", flex: 1, minWidth: "200px" }} />
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "#446ebb", color: "white", border: "none", borderRadius: "5px" }}>Fetch</button>
      </form>

      {/* Daily Summary */}
      {!selectedCard && !showFullForecast && weatherData && Object.keys(weatherData).length > 0 && (
        <div style={{ display: "flex", gap: "15px", overflowX: "auto" }}>
          {getDailySummary().map((day) => (
            <div key={day.dayKey} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <h3 style={{ color: "#446ebb" }}>{day.dayKey}</h3>
              {renderCard(day.entry)}
              <button onClick={() => setShowFullForecast(day.dayKey)} style={{ marginTop: "5px", cursor: "pointer" }}>See Full Forecast</button>
            </div>
          ))}
        </div>
      )}

      {/* Full Forecast */}
      {showFullForecast && weatherData && weatherData[showFullForecast] && !selectedCard && (
        <div>
          <button onClick={() => setShowFullForecast(null)} style={{ marginBottom: "10px", cursor: "pointer" }}>← Back to summary</button>
          <h3 style={{ color: "#446ebb" }}>Full Forecast for {showFullForecast}</h3>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
            {weatherData[showFullForecast].map((entry, idx) => (
              <div key={idx}>{renderCard(entry)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Card Details */}
      {selectedCard && (
        <div>
          <button onClick={() => setSelectedCard(null)} style={{ marginBottom: "10px", cursor: "pointer" }}>← Back to full forecast</button>
          <h3 style={{ color: "#446ebb" }}>Weather Details</h3>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: "500px", color: "black" }}>
            <img src={selectedCard.weatherIcon} alt={selectedCard.weatherDescription} width={64} height={64} />
            <p><strong>Date & Time:</strong> {new Date(selectedCard.date).toLocaleString()}</p>
            <p><strong>Temperature:</strong> {selectedCard.temperature}°C</p>
            <p><strong>Feels Like:</strong> {selectedCard.feelsLike}°C</p>
            <p><strong>Humidity:</strong> {selectedCard.humidity}%</p>
            <p><strong>Pressure:</strong> {selectedCard.pressure} hPa</p>
            <p><strong>Wind:</strong> {selectedCard.windSpeed} m/s, {selectedCard.windDeg}°</p>
            <p><strong>Clouds:</strong> {selectedCard.clouds}%</p>
            <p><strong>Rain:</strong> {selectedCard.rain ?? 0} mm</p>
            <p><strong>Description:</strong> {selectedCard.weatherDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

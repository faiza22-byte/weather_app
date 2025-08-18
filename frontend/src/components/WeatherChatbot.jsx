// WeatherChatbot.jsx
import React from "react";

export default function WeatherChatbot() {
  return (
    <div style={{
      flex: 1,
      backgroundColor: "white",
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 16,
    }}>
      <h4 style={{ marginTop: 0, marginBottom: 8 }}>Weather Chatbot</h4>
      <div style={{
        flex: 1,
        backgroundColor: "#f7f9fc",
        borderRadius: 6,
        padding: 8,
        overflowY: "auto",
        fontSize: 14,
        color: "#333",
      }}>
        {/* Chatbot messages placeholder */}
        <p style={{ fontStyle: "italic", color: "#888" }}>
          Ask me about weather forecasts, alerts, or conditions!
        </p>
      </div>
      <input
        type="text"
        placeholder="Type your question..."
        style={{
          marginTop: 8,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #ccc",
          fontSize: 14,
          outline: "none",
        }}
        disabled
      />
    </div>
  );
}

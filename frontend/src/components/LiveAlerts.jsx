import axios from "axios";
import { useEffect, useState } from "react";

export default function LiveAlerts({ userId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/live-alerts/${userId}`);
        console.log(userId, "userId in LiveAlerts component");
        console.log("Fetched alerts:", res.data.alerts);
        setAlerts(res.data.alerts || []);
      } catch (error) {
        console.error("❌ Error fetching live alerts:", error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);

  return (
    <div
      style={{
        flex: "0 0 auto",
        backgroundColor: "#fff0f0",
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        fontSize: 14,
        color: "#900",
        maxHeight: 300,
        overflowY: "auto",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 8, color: "#c00" }}>Daily Alerts</h4>

      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No alerts for today</p>
      ) : (
        alerts.map((alert, idx) => (
          <div key={idx} style={{ marginBottom: 16 }}>
            <h5 style={{ margin: "4px 0" }}>{alert.location}</h5>
            {alert.timeline?.length > 0 ? (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {alert.timeline.map((t, index) => (
                  <li key={index} style={{ marginBottom: 6 }}>
                    <strong>{t.icon} {t.time}:</strong> {t.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No timeline data</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

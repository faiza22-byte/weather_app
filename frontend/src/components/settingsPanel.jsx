import axios from "axios";
import { Settings, Save } from "lucide-react";
import { useEffect, useState } from "react";

// Decode JWT safely
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

export default function SettingsPanel() {
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  // Load userId from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.token) {
      const decoded = parseJwt(userData.token);
      const id = decoded?.id || userData._id;
      if (id) setUserId(id.trim());
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current profile
  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/profile/${userId}`);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
        });
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle save (update profile)
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/profile/${userId}`,
        formData
      );
      alert("✅ Profile updated successfully!");
      console.log("Updated user:", res.data);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <div style={{ padding: "12px", color: "black" }}>Loading...</div>;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        width: "400px",
        color: "black",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ padding: "8px", backgroundColor: "#e5e7eb", borderRadius: "50%" }}>
          <Settings size={22} style={{ color: "black" }} />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Settings</h2>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: "80%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: "80%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          width: "35%",
          marginTop: "25px",
          padding: "12px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Save size={18} /> Save
      </button>
    </div>
  );
}

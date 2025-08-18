import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Helper function to decode JWT manually
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

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setMessage("Signup successful! Redirecting...");
        setFormData({ name: "", email: "", password: "" });

        const decoded = parseJwt(data.token);
        localStorage.setItem("user", JSON.stringify({ ...decoded, token: data.token }));

        // Redirect to dashboard
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
    }
  };

  const inputStyle = {
    padding: "16px 20px",
    fontSize: "1.2rem",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#000",
    color: "white",
    transition: "background-color 0.3s ease",
    outline: "none",
  };

  return (
    <div
      className="signup-container"
      style={{
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#000",
        padding: "2.5rem 2rem",
        borderRadius: 15,
        display: "flex",
        flexDirection: "column",
        color: "white",
        userSelect: "none",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          color: "#446ebbff",
          marginBottom: "2rem",
          textAlign: "center",
          textShadow: "0 0 15px #1b3d7dff",
        }}
      >
        Forecast Flow
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
          style={inputStyle}
          onFocus={(e) => (e.target.style.backgroundColor = "#111")}
          onBlur={(e) => (e.target.style.backgroundColor = "#000")}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          style={inputStyle}
          onFocus={(e) => (e.target.style.backgroundColor = "#111")}
          onBlur={(e) => (e.target.style.backgroundColor = "#000")}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          style={inputStyle}
          onFocus={(e) => (e.target.style.backgroundColor = "#111")}
          onBlur={(e) => (e.target.style.backgroundColor = "#000")}
        />

        <button
          type="submit"
          style={{
            padding: "14px",
            fontSize: "1.3rem",
            fontWeight: 700,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(145deg, #071565ff, #030838ff)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", color: "#aaa", textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#134b8fff", textDecoration: "none" }}>
          Login
        </Link>
      </p>

      {message && (
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#ffbaba", fontWeight: 700 }}>
          {message}
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Manual JWT decoding function
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setMessage("Login successful! Redirecting...");

        // ✅ Decode JWT manually
        const decoded = parseJwt(data.token);
        const userData = { _id: decoded.id, token: data.token };

        // ✅ Store in localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "Login failed.");
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
      className="login-container"
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
        boxShadow: "none",
      }}
    >
      <h2
        className="app-name"
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
        className="login-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}
      >
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
          autoComplete="current-password"
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
            boxShadow:
              "3px 3px 8px rgba(5, 14, 86, 0.8), -3px -3px 8px rgba(5, 15, 72, 0.9)",
            transition: "background 0.3s ease",
          }}
        >
          Login
        </button>
      </form>

      <p
        style={{
          marginTop: "1.5rem",
          color: "#aaa",
          fontSize: "1.2rem",
          textAlign: "center",
        }}
      >
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#134b8fff", textDecoration: "none" }}>
          Sign Up
        </Link>
      </p>

      {message && (
        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            color: "#ffbaba",
            fontWeight: 700,
          }}
        >
          {message}
        </p>
      )}

      <footer
        style={{
          marginTop: "auto",
          paddingTop: "1.5rem",
          color: "#555",
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      >
        &copy; {new Date().getFullYear()} Forecast Flow. All rights reserved.
      </footer>
    </div>
  );
}

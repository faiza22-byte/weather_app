import { useState } from "react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email input, 2=otp input
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent to your email. Please check.");
        setStep(2);
      } else {
        setMessage(data.message || "Failed to send OTP.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!otp) {
      setMessage("Please enter the OTP.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP verified! You can now reset your password.");
        // Optionally, redirect or show new password input
      } else {
        setMessage(data.message || "Invalid OTP.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
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
    marginBottom: "1rem",
  };

  const buttonStyle = {
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
  };

  return (
    
    <div
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
        margin: "auto",
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
          userSelect: "none",
        }}
      >
        Reset Password
      </h2>

      {step === 1 && (
        <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.backgroundColor = "#111")}
            onBlur={(e) => (e.target.style.backgroundColor = "#000")}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.backgroundColor = "#111")}
            onBlur={(e) => (e.target.style.backgroundColor = "#000")}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {message && (
        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            color: message.toLowerCase().includes("error") ? "#ff6b6b" : "#7fff7f",
            fontWeight: 700,
            userSelect: "none",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

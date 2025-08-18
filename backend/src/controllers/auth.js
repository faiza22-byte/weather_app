import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.js";

// -------------------- SIGNUP --------------------
export const signup = async (req, res) => {
  const { name, email, password } = req.body; // removed captcha & type

  try {
    // 1. CHECK IF USER EXISTS
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2. CREATE USER
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // 3. SEND JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. SEND WELCOME EMAIL
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,  // using .env MAIL_USER
        pass: process.env.EMAIL_PASS, // using .env EMAIL_PASS
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Welcome to WeatherWise ☀️🌧️",
      html: `<h1>Welcome, ${name}!</h1><p>Your account has been created successfully.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Explicitly select password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// -------------------- SEND RESET OTP --------------------
export const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const curr_user = await User.findOne({ email });

    if (!curr_user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    curr_user.otp = otp;
    curr_user.otpExpires = otpExpires;
    await curr_user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "WeatherWise Password Reset OTP",
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// -------------------- VERIFY OTP & RESET PASSWORD --------------------
export const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const curr_user = await User.findOne({ email });

    if (!curr_user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(curr_user.otp) !== String(otp) || Date.now() > curr_user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    curr_user.password = hashedPassword;
    curr_user.otp = undefined;
    curr_user.otpExpires = undefined;

    await curr_user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed", error: err.message });
  }
};

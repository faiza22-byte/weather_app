import express from "express";
import {
    login,
    sendResetOTP,
    signup,
    verifyOTPAndResetPassword,
} from "../controllers/auth.js";

const router = express.Router();

// User signup
router.post("/signup", signup);

// User login
router.post("/login", login);

// Send password reset OTP
router.post("/reset-password", sendResetOTP);

// Verify OTP and reset password
router.post("/verify-otp", verifyOTPAndResetPassword);

export default router;

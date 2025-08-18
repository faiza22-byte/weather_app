import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true // Removes extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Emails stored in lowercase
      trim: true
    },
    password: {
      type: String,
      select: false // Exclude password by default in queries
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      default: "local", // Can also be "firebase" or other social login providers
      enum: ["local", "firebase", "google", "github"]
    },
    otp: {
      type: String // For password reset
    },
    otpExpires: {
      type: Date
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

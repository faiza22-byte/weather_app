// models/Landmark.js
import mongoose from "mongoose";

const LandmarkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export default mongoose.model("Landmark", LandmarkSchema);

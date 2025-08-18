import mongoose from "mongoose";

const WeatherEntrySchema = new mongoose.Schema({
  location: { type: String, required: true },
  date: { type: Date, required: true },
  temperature: { type: Number, required: true },
  feelsLike: { type: Number },
  humidity: { type: Number },
  pressure: { type: Number },
  windSpeed: { type: Number },
  windDeg: { type: Number },
  clouds: { type: Number },
  rain: { type: Number, default: 0 },
  weatherDescription: { type: String, required: true },
  weatherIcon: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.weatherentries ||
  mongoose.model("weatherentries", WeatherEntrySchema);

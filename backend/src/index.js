import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./db.js"; // Database connection
import router from "./routes/auth.js";
import exportRoutes from "./routes/exportRoutes.js"; // Export routes
import LiveAlerts from "./routes/liveAlertRoutes.js"; // Live alerts routes
import profileRoutes from "./routes/profileRoutes.js";
import weather from "./routes/weather.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🌤 Weather App Backend is running...");
});

app.use("/api/auth", router);
app.use("/api/weather",weather);
app.use("/api/export", exportRoutes);  
app.use("/api",LiveAlerts ); 
app.use("/api/profile", profileRoutes);
app.use("/api", youtubeRoutes);
// Connect to DB and then start server
const startServer = async () => {
  try {
    await connectDB(); // Wait for MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1); // Exit process on failure
  }
};

startServer();

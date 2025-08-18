import express from "express";
import { getAllWeatherEntries, exportWeatherEntries } from "../controllers/exportController.js";

const router = express.Router();

// Fetch all entries for selection
router.get("/", getAllWeatherEntries);

// Export selected entries in chosen format
router.post("/", exportWeatherEntries);

export default router;

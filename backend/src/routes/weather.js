import express from 'express';
import { createWeatherEntry, deleteWeatherEntry, getAllWeatherEntries, getWeatherByCoords, updateWeatherEntry } from '../controllers/weather.js';
const router = express.Router();

// POST /api/weather/create
router.post('/create', createWeatherEntry);
router.get("/all", getAllWeatherEntries);
router.put("/update/:id", updateWeatherEntry);
router.delete("/delete/:id", deleteWeatherEntry);
router.post("/current-location", getWeatherByCoords);

export default router;

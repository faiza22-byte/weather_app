import express from "express";
import { getDailyAlerts } from "../controllers/liveAlertController.js";

const router = express.Router();

// GET /api/live-alerts/:userId
router.get("/live-alerts/:userId", getDailyAlerts);

export default router;

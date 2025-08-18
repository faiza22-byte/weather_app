import express from "express";
import { getYoutubeVideos } from "../controllers/youtubeController.js";

const router = express.Router();

// GET /api/youtube-videos?location=cityName
router.get("/youtube-videos", getYoutubeVideos);

export default router;

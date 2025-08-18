// routes/profileRoutes.js
import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/profileController.js";

const router = express.Router();

// GET user profile
router.get("/:id", getUserProfile);

// PUT update profile
router.put("/:id", updateUserProfile);

export default router;

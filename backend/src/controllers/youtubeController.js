import axios from "axios";
import dotenv from "dotenv";
import WeatherEntry from "../models/WeatherEntry.js"; // your Mongoose model
dotenv.config();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export const getYoutubeVideos = async (req, res) => {
  try {
    // 1️⃣ Fetch latest weather entries (sorted by date descending)
    const latestEntries = await WeatherEntry.find().sort({ date: -1 });

    // 2️⃣ Extract unique locations
    const uniqueLocations = [];
    for (let entry of latestEntries) {
      if (entry.location && !uniqueLocations.includes(entry.location)) {
        uniqueLocations.push(entry.location);
      }
      if (uniqueLocations.length === 3) break; // only top 3
    }

    const videosPerLocation = [];

    // 3️⃣ Fetch videos for each unique location
    for (const location of uniqueLocations) {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: `${location} weather`,
          maxResults: 3,
          order: "date",
          key: YOUTUBE_API_KEY,
          type: "video",
        },
      });

      const videos = response.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
      }));

      videosPerLocation.push({ location, videos });
    }

    res.json({ videosPerLocation });
  } catch (err) {
    console.error("Failed to fetch YouTube videos:", err);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
};

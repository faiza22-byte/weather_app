import { useEffect, useState } from "react";
import axios from "axios";

export default function VideoPanel({ onClose }) {
  const [videoSuggestions, setVideoSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/youtube-videos");
        const data = res.data.videosPerLocation;
        setVideoSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch YouTube videos", err);
        setError("Failed to fetch videos");
      }
    };

    fetchVideos();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Cross button to close panel */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "black",
          }}
        >
          ✖
        </button>

        <h2 style={{ color: "black", marginBottom: "20px" }}>
          Top Youtube videos on latest weather updates for Your Locations based on your recent searches
        </h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {videoSuggestions.length === 0 ? (
          <p>No video suggestions available.</p>
        ) : (
          videoSuggestions.map(({ location, videos }) => (
            <div key={location} style={{ marginBottom: "20px" }}>
              {/* Label for the location */}
              <h3 style={{ marginBottom: "10px", color: "#333" }}>
                Videos for {location}:
              </h3>

              {(!Array.isArray(videos) || videos.length === 0) ? (
                <p>No videos found for this location.</p>
              ) : (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {videos.map((video) => (
                    <a
                      key={video.videoId}
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textAlign: "center", width: "150px" }}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={{ width: "100%" }}
                      />
                      <p style={{ fontSize: "12px" }}>{video.title}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

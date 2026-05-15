const express = require("express");
const cors = require("cors");
const yts = require("yt-search");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Home Route
app.get("/", (req, res) => {
  res.json({
    status: "✅ Running",
    api_name: "Rocky YT API",
    author: "Rocky Chowdhury",
    endpoints: {
      search: "/api?search=YOUR_QUERY",
      video_info: "/video?url=YOUTUBE_URL"
    }
  });
});

// ✅ Search Route
app.get("/api", async (req, res) => {
  const query = req.query.search;

  if (!query) {
    return res.status(400).json({
      error: "Please provide search query",
      example: "/api?search=Let Me Love You"
    });
  }

  try {
    const result = await yts(query);
    const videos = result.videos.slice(0, 5).map(v => ({
      title: v.title,
      url: v.url,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      views: v.views,
      author: v.author.name
    }));

    if (videos.length === 0) {
      return res.status(404).json({ error: "No videos found" });
    }

    res.json(videos);

  } catch (err) {
    res.status(500).json({
      error: "Search failed",
      message: err.message
    });
  }
});

// ✅ Video Info + Download Link Route
app.get("/video", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      error: "Please provide YouTube URL",
      example: "/video?url=https://youtube.com/watch?v=XXXX"
    });
  }

  try {
    // Using y2mate style API for download link
    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) throw new Error("Invalid YouTube URL");

    const result = await yts({ videoId });

    res.json({
      title: result.title,
      url: result.url,
      thumbnail: result.thumbnail,
      duration: result.timestamp,
      views: result.views,
      author: result.author.name,
      downloadUrl: `https://api.vevioz.com/api/button/mp4/${videoId}`
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to get video info",
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rocky YT API running on port ${PORT}`);
});

module.exports = app;

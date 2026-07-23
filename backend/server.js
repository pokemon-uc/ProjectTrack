const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const pool = require("./config/database");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication requests. Try again later." },
});

const authRoutes = require("./routes/auth.routes");
const submissionRoutes = require("./routes/submission.routes");
const projectRoutes = require("./routes/project.routes");
const milestoneRoutes = require("./routes/milestone.routes");
const notificationRoutes = require("./routes/notification.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const gradeRoutes = require("./routes/grade.routes");
const discussionRoutes = require("./routes/discussion.routes");

app.get("/", (req, res) => {
  res.send("ProjectTrack API is running");
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", submissionRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", milestoneRoutes);
app.use("/api", notificationRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", gradeRoutes);
app.use("/api", discussionRoutes);

// Uploaded files are intentionally not exposed with express.static.
// Downloads must pass the protected submission-version endpoint.

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch {
    res.status(500).json({ success: false, error: "Database check failed" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 10 MB."
        : "File upload failed";
    return res.status(400).json({ error: message });
  }

  if (err.message === "Unsupported file type") {
    return res.status(400).json({
      error: "Only PDF, DOC, and DOCX files are allowed",
    });
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
require("dotenv").config();

const pool = require("./config/database");
const { connectRedis, closeRedis } = require("./config/redis");

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
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(express.json({ limit: "100kb" }));

const openApiPath = path.join(__dirname, "docs", "openapi.yaml");
const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "ProjectTrack API Documentation",
    swaggerOptions: { persistAuthorization: true },
  }),
);
app.get("/api/openapi.json", (req, res) => res.json(openApiDocument));

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

let redisClient = null;

const createAuthLimiter = () => {
  const options = {
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many authentication requests. Try again later." },
  };

  if (redisClient) {
    options.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: "projecttrack:auth:",
    });
  }

  return rateLimit(options);
};

const mountRoutes = () => {
  app.use("/api/auth", createAuthLimiter(), authRoutes);
  app.use("/api", submissionRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api", milestoneRoutes);
  app.use("/api", notificationRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", feedbackRoutes);
  app.use("/api", gradeRoutes);
  app.use("/api", discussionRoutes);
};

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    const redis = redisClient?.isReady ? "ready" : "memory-fallback";
    return res.json({ status: "ok", database: "ready", redis });
  } catch (error) {
    console.error(error);
    return res.status(503).json({ status: "unavailable" });
  }
});

// Uploaded files are intentionally not exposed with express.static.
// Downloads must pass the protected submission-version endpoint.

const mountErrorHandlers = () => {
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
};

const PORT = Number(process.env.PORT || 5000);
let server;

const start = async () => {
  redisClient = await connectRedis();
  mountRoutes();
  mountErrorHandlers();
  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down.`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeRedis();
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});

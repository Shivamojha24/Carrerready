// Load environment variables FIRST
const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const studentRoutes = require("./routes/studentRoutes");
const placementRoutes = require("./routes/placementRoutes");
const driveRoutes = require("./routes/driveRoutes");
const matchRoutes = require("./routes/matchRoutes");
const readinessRoutes = require("./routes/readinessRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const recommendedRoutes = require("./routes/recommendedRoutes");
const placementApplicationRoutes = require("./routes/placementApplicationRoutes");
const placementDashboardRoutes = require("./routes/placementDashboardRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const progressionRoutes = require("./routes/progressionRoutes");
const connectDB = require("./config/db");
const mentorRoutes = require("./routes/mentorRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

const {
  authLimiter,
  apiLimiter
} = require("./middleware/rateLimiter");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY
// ==========================================

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://127.0.0.1:5500",
    credentials: true
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(
  express.json({
    limit: "10kb"
  })
);

// ==========================================
// LOGGING
// ==========================================

app.use(morgan("dev"));

// ==========================================
// RATE LIMITING
// ==========================================

app.use("/api", apiLimiter);

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

// ==========================================
// OTHER API ROUTES
// ==========================================

app.use(
  "/api/test",
  testRoutes
);

app.use(
  "/api/student",
  studentRoutes
);

app.use(
  "/api/placement",
  placementRoutes
);

app.use(
  "/api/drives",
  driveRoutes
);

app.use(
  "/api/match",
  matchRoutes
);

app.use(
  "/api/readiness",
  readinessRoutes
);
app.use(
  "/api/roadmap",
  roadmapRoutes
);
app.use("/api/progression", progressionRoutes);
app.use("/api/mentor", mentorRoutes);
app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/recommended",
  recommendedRoutes
);

app.use(
  "/api/placement-applications",
  placementApplicationRoutes
);

app.use(
  "/api/placement-dashboard",
  placementDashboardRoutes
);

app.use(
  "/api/student-dashboard",
  studentDashboardRoutes
);

// ==========================================
// OPENAI AI ROUTES
// ==========================================

app.use(
  "/api/ai",
  aiRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "CareerReady API"
    });
  }
);

// ==========================================
// ROOT
// ==========================================

// ==========================================
// SERVE FRONTEND
// ==========================================

const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }
);

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================

app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `CareerReady API running on port ${PORT}`
        );

        console.log(
          `http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
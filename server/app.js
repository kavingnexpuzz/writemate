const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const { errorHandler, notFound } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  const allowedOrigins = [
    ...(process.env.CLIENT_URL || "").split(","),
    "https://writermate.vercel.app/api",
    "http://localhost:5173",
  ]
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || allowedOrigins.includes(requestOrigin))
          return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });
  app.use("/api", limiter);

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "WriteMate API is running",
      data: { time: new Date().toISOString() },
    });
  });

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/writers", require("./routes/writerRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));
  app.use("/api/requests", require("./routes/requestRoutes"));
  app.use("/api/quotations", require("./routes/quotationRoutes"));
  app.use("/api/payments", require("./routes/paymentRoutes"));

  // --------------------------------------------------------------------
  // Remaining route mounts land here phase by phase:
  //   app.use('/api/notifications', require('./routes/notificationRoutes')); // Phase 7
  //   app.use('/api/reviews', require('./routes/reviewRoutes'));      // Phase 8
  //   app.use('/api/complaints', require('./routes/complaintRoutes'));// Phase 8
  // --------------------------------------------------------------------

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

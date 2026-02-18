const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const createRouter = require("./routes/index");

// ── Import controllers (one per collection) ──────────
const userController    = require("./controllers/user.controller");
const payloadController = require("./controllers/payload.controller");
const deviceController  = require("./controllers/device.controller");
// To add a new collection: import its controller here ↑

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ── Mount routes (one line per collection) ────────────
app.use("/api/users",    createRouter(userController));
app.use("/api/payloads", createRouter(payloadController));
app.use("/api/devices",  createRouter(deviceController));
// To add a new collection: app.use("/api/my-thing", createRouter(myThingController)) ↑

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;

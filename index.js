// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route to check if server is running
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Server is running fine!" });
});

// ✅ Mock registration route (the frontend might call /api/auth/register)
app.post(["/api/auth/register", "/auth/register"], (req, res) => {
  console.log("Register data received:", req.body);
  res.status(201).json({ message: "User registered successfully", user: req.body });
});

// ✅ Mock prediction route (the frontend might call /predict or /api/predict)
app.post(["/predict", "/api/predict"], (req, res) => {
  console.log("Prediction request received:", req.body);
  res.json({
    color: "blue",
    style: "casual",
    recommended: ["item1", "item2", "item3"],
  });
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});

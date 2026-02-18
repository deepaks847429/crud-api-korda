require("dotenv").config();
const mongoose = require("mongoose");
const app      = require("./src/app");

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

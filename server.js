const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config"); //  for DB connection
const path = require("path");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

//  API routes
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/recipes", require("./routes/recipeRoutes")); 
app.use("/api/favorites", require("./routes/favoriteRoutes")); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

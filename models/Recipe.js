const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: [String],
  instructions: String,
  image: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});

module.exports = mongoose.model("Recipe", RecipeSchema);

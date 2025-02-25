const express = require("express");
const Recipe = require("../models/Recipe");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload"); // Multer for image uploads
const mongoose = require("mongoose");

const router = express.Router();

//  GET: Fetch all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Fetch all recipes
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  GET: Fetch a single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  POST: Add a new recipe with image upload
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized - Please log in again" });
    }

    const { title, description, ingredients, instructions } = req.body;

    const recipe = new Recipe({
      title,
      description,
      ingredients: JSON.parse(ingredients),
      instructions,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      user: req.user.userId, 
    });

    await recipe.save();
    res.status(201).json({ message: "Recipe added successfully", recipe });
  } catch (error) {
    console.error("🔥 Error adding recipe:", error);
    res.status(500).json({ message: "Server error while adding recipe" });
  }
});

//  PUT: Update a recipe (Only Owner Can Edit)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const recipeId = req.params.id.trim();

    //  the ID is valid
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid Recipe ID" });
    }

    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    //   only the owner can update
    if (!recipe.user || recipe.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this recipe" });
    }

    // Update recipe details
    recipe.title = req.body.title || recipe.title;
    recipe.description = req.body.description || recipe.description;
    recipe.ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    if (req.file) {
      recipe.image = `/uploads/${req.file.filename}`;
    }

    await recipe.save();
    res.json({ message: "Recipe updated successfully", recipe });

  } catch (error) {
    console.error("🔥 Error updating recipe:", error);
    res.status(500).json({ message: "Server error while updating recipe", error: error.message });
  }
});

//  DELETE: Delete a recipe (Only Owner Can Delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id.trim();

    //  Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid Recipe ID" });
    }

    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if the logged-in user is the owner of the recipe
    if (!recipe.user || recipe.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this recipe" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting recipe:", error);
    res.status(500).json({ message: "Server error while deleting recipe", error: error.message });
  }
});

module.exports = router;

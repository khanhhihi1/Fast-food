const express = require("express");
const router = express.Router();
const favoriteController = require("../controller/favoriteController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/favorites/:productId", authMiddleware, favoriteController.toggleFavorite);
router.get("/favorites", authMiddleware, favoriteController.getFavorites);

module.exports = router;

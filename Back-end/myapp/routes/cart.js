const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();
// http://localhost:5000/cart/add
const { addToCart, getAllCart, removeFromCart } = require("../controller/cartController.js");

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getAllCart);
router.delete("/remove/:id", authMiddleware, removeFromCart); 

module.exports = router;

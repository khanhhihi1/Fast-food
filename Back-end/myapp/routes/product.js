const express = require("express");
const router = express.Router();
const productsController = require("../controller/productController.js");
const multer = require("multer");

// Cấu hình multer (giữ nguyên)

// Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let result;

    if (!category || category === "all") {
      // Trả tất cả
      result = await productsController.getAllPro();
    } else {
      // Lọc theo categoryId
      result = await productsController.getProductsByCategory(category);
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const result = await productsController.getActiveProducts();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

router.get("/inactive", async (req, res) => {
  try {
    const result = await productsController.getInactiveProducts();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

router.post("/addProduct", async (req, res) => {
  try {
    const data = req.body;
    const result = await productsController.addPro(data);
    res.status(201).json({
      success: true,
      result,
      image: data.image,
      message: "Thêm sản phẩm thành công",
    });
  } catch (error) {
    const statusCode =
      error.message.includes("Thiếu trường") ||
      error.message.includes("Danh mục không tồn tại") ||
      error.message.includes("Hình ảnh phải là URL")
        ? 400
        : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!data.image) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu URL hình ảnh" });
    }
    const result = await productsController.updateProduct(data, id);
    res.status(200).json({
      success: true,
      result,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

router.delete("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.hideProduct(id);
    res
      .status(200)
      .json({ success: true, result, message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/show/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.showProduct(id);
    res
      .status(200)
      .json({ success: true, result, message: "Hiển thị sản phẩm thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/hot", async (req, res) => {
  try {
    const result = await productsController.getHotProducts();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const result = await productsController.searchProducts(req);
    res
      .status(200)
      .json({ success: true, result, message: "Tìm kiếm thành công" });
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi tìm kiếm sản phẩm" });
  }
});

router.get("/discount", async (req, res) => {
  try {
    const result = await productsController.getDiscountProduct();
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.getDatailPro(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;

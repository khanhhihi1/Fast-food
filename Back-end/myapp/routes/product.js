const express = require("express");
const router = express.Router();
const productsController = require("../controller/productController.js");
const multer = require("multer");

// Cấu hình lưu trữ file ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Kiểm tra định dạng file ảnh
const checkFile = (req, file, cb) => {
  const fileTypes = /jpg|jpeg|png$/;
  const extName = fileTypes.test(file.originalname.toLowerCase());
  if (extName) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png)!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: checkFile,
});

// Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    const result = await productsController.getAllPro();
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Lấy sản phẩm đang bán
router.get("/active", async (req, res) => {
  try {
    const result = await productsController.getActiveProducts();
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Lấy sản phẩm ngưng bán
router.get("/inactive", async (req, res) => {
  try {
    const result = await productsController.getInactiveProducts();
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Thêm sản phẩm mới
router.post("/addProduct", async (req, res) => {
  try {
    const data = req.body;
    const result = await productsController.addPro(data);
    res.status(201).json({
      status: true,
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
    res.status(statusCode).json({ status: false, message: error.message });
  }
});

// Cập nhật sản phẩm
router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!data.image) {
      return res
        .status(400)
        .json({ status: false, message: "Thiếu URL hình ảnh" });
    }
    const result = await productsController.updateProduct(data, id);
    res.status(200).json({
      status: true,
      result,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Ẩn sản phẩm
router.delete("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.hideProduct(id);
    res
      .status(200)
      .json({ status: true, result, message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Hiển thị sản phẩm
router.put("/show/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.showProduct(id);
    res
      .status(200)
      .json({ status: true, result, message: "Hiển thị sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Lấy sản phẩm hot
router.get("/hot", async (req, res) => {
  try {
    const result = await productsController.getHotProducts();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Lấy chi tiết sản phẩm theo ID
// http://localhost:5000/products/685c215d94fac3b3a5e7d7bf
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.getDatailPro(id);
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;

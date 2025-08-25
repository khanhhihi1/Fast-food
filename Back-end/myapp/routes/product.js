const express = require("express");
const router = express.Router();
const productsController = require("../controller/productController.js");
const multer = require("multer");

<<<<<<< HEAD
// Cấu hình multer (giữ nguyên)
=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

// Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
<<<<<<< HEAD
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

=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.post("/addProduct", async (req, res) => {
  try {
    const data = req.body;
    const result = await productsController.addPro(data);
    res.status(201).json({
<<<<<<< HEAD
      success: true,
=======
      status: true,
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
      result,
      image: data.image,
      message: "Thêm sản phẩm thành công",
    });
  } catch (error) {
    const statusCode =
      error.message.includes("Thiếu trường") ||
<<<<<<< HEAD
      error.message.includes("Danh mục không tồn tại") ||
      error.message.includes("Hình ảnh phải là URL")
        ? 400
        : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

=======
        error.message.includes("Danh mục không tồn tại") ||
        error.message.includes("Hình ảnh phải là URL")
        ? 400
        : 500;
    res.status(statusCode).json({ status: false, message: error.message });
  }
});

// Cập nhật sản phẩm
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!data.image) {
      return res
        .status(400)
<<<<<<< HEAD
        .json({ success: false, message: "Thiếu URL hình ảnh" });
    }
    const result = await productsController.updateProduct(data, id);
    res.status(200).json({
      success: true,
=======
        .json({ status: false, message: "Thiếu URL hình ảnh" });
    }
    const result = await productsController.updateProduct(data, id);
    res.status(200).json({
      status: true,
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
      result,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

=======
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Ẩn sản phẩm
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.delete("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.hideProduct(id);
    res
      .status(200)
<<<<<<< HEAD
      .json({ success: true, result, message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

=======
      .json({ status: true, result, message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Hiển thị sản phẩm
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.put("/show/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.showProduct(id);
    res
      .status(200)
<<<<<<< HEAD
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

=======
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
// sp discount
// http://localhost:5000/products/discount
router.get("/discount", async (req, res) => {
  try {
    const result = await productsController.getDiscountProduct();

    res.status(200).json({ status: true, result});
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});
// không đc viết các router lấy sp sau api id
// Lấy chi tiết sản phẩm theo ID
// http://localhost:5000/products/685cb8c8d73334a073c656a4
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.getDatailPro(id);
<<<<<<< HEAD
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
=======
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  }
});

module.exports = router;

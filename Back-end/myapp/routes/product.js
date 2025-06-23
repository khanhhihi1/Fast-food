var express = require("express");
var router = express.Router();
const productsController = require("../controller/productController.js");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
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

module.exports = upload;

// http://localhost:5000/products
router.get("/", async (req, res) => {
  try {
    const result = await productsController.getAllPro();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// http://localhost:5000/products/active
router.get("/active", async (req, res) => {
  try {
    const result = await productsController.getActiveProducts();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đang bán:", error.message);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// http://localhost:5000/products/inactive
router.get("/inactive", async (req, res) => {
  try {
    const result = await productsController.getInactiveProducts();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm ngưng bán:", error.message);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// http://localhost:5000/products/addProduct
router.post("/addProduct", async (req, res) => {
  try {
    const data = req.body;

    const result = await productsController.addPro(data);
    return res.status(201).json({
      status: true,
      result,
      image: data.image,
      message: "Thêm sản phẩm thành công",
    });
  } catch (error) {
    console.error("Lỗi chi tiết:", error);
    const statusCode =
      error.message.includes("Thiếu trường bắt buộc") ||
      error.message.includes("Danh mục không tồn tại") ||
      error.message.includes("Hình ảnh phải là URL")
        ? 400
        : 500;
    return res
      .status(statusCode)
      .json({ status: false, message: error.message });
  }
});

// http://localhost:5000/products/updateProduct/681c9cf2bc60e77b1ccbc40a
router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
      if (!data.image) {
      return res.status(400).json({ status: false, message: "Thiếu URL hình ảnh" });
    }
    const result = await productsController.updateProduct(data, id);
    return res.status(201).json({
      status: true,
      result,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// http://localhost:5000/products/hide/681c9cf2bc60e77b1ccbc40a
router.delete("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.hideProduct(id);
    return res
      .status(200)
      .json({ status: true, result, message: "ẩn sản phẩm thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// http://localhost:5000/products/show/681c9cf2bc60e77b1ccbc40a
router.put("/show/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.showProduct(id);
    return res
      .status(200)
      .json({ status: true, result, message: "Hiển thị sản phẩm thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/products/hot
router.get("/hot", async (req, res) => {
  try {
    const result = await productsController.getHotProducts();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});
// http://localhost:5000/products/681cb62cbc60e77b1ccbc469
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.getDatailPro(id);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;

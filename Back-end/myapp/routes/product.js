const express = require("express");
const router = express.Router();
const productsController = require("../controller/productController.js");
const multer = require("multer");
const path = require("path");

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../myapp/public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // giữ lại đuôi file
  },
});

// Danh sách loại file cho phép
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Chỉ chấp nhận file ảnh định dạng: jpg, jpeg, png, gif, webp!"));
    }
    cb(null, true);
  },
});

module.exports = upload;

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

router.post("/addProduct", upload.single("image"), async (req, res) => {
  try {
    console.log("👉 [API CALL] /addProduct");
    console.log("👉 req.body (raw):", req.body);
    console.log("👉 req.file:", req.file);

    const data = req.body;

    // Parse JSON fields
    try {
      if (typeof data.taste === "string") {
        data.taste = JSON.parse(data.taste);
      }
      if (typeof data.sizes === "string") {
        data.sizes = JSON.parse(data.sizes);
      }
    } catch (err) {
      console.error("❌ Parse JSON lỗi:", err.message);
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu sizes hoặc taste không hợp lệ" });
    }

    console.log("👉 req.body (parsed):", data);

    const imagePath = req.file ? `/images/${req.file.filename}` : "";

    const result = await productsController.addPro(data, imagePath);

    console.log("✅ Product đã lưu:", result);

    res.status(201).json({
      success: true,
      result,
      image: imagePath,
      message: "Thêm sản phẩm thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error.stack);
    const statusCode =
      error.message.includes("Thiếu trường") ||
        error.message.includes("Danh mục không tồn tại") ||
        error.message.includes("Chỉ chấp nhận file ảnh")
        ? 400
        : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

router.post("/reset-daily", async (req, res) => {
  try {
    const result = await productsController.resetAllDailyProducts();
    return res.status(200).json({
      status: true,
      message: `Reset daily products thành công (thủ công).`,
      result,
    });
  } catch (error) {
    console.error("❌ Lỗi khi reset daily products:", error);
    return res.status(500).json({
      status: false,
      message: "Reset daily products thất bại: " + error.message,  // Thêm chi tiết lỗi để debug
    });
  }
});

router.put("/updateProduct/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (typeof data.taste === "string") {
      data.taste = JSON.parse(data.taste);
    }
    if (typeof data.sizes === "string") {
      data.sizes = JSON.parse(data.sizes);
    }
    const imagePath = req.file ? `/images/${req.file.filename}` : data.image;; // Chỉ cập nhật nếu có file mới
    const result = await productsController.updateProduct(data, id, imagePath);
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
router.post("/restock-multiple", async (req, res) => { // API mới cho restock multiple
  try {
    const { items } = req.body; // items: [{id, qty}, ...]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách items không hợp lệ" });
    }

    await productsController.restockMultiple(items);
    res.status(200).json({ success: true, message: "Cập nhật số lượng thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/restock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // quantity: số lượng muốn nhập/restock

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Số lượng nhập phải lớn hơn 0" });
    }

    const product = await productsController.restockProduct(id, quantity);

    res.status(200).json({
      success: true,
      result: product,
      message: "Nhập liệu thành công"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/daily-products", async (req, res) => {
  try {
    const result = await productsController.getDailyProducts();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// New API: List all inventory (non-daily) products
router.get("/inventory-products", async (req, res) => {
  try {
    const result = await productsController.getInventoryProducts();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// New API: List slow daily products for manual restock
router.get("/slow-daily", async (req, res) => {
  try {
    const result = await productsController.getSlowDailyProducts();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Thiếu message" });
    }

    const data = await productsController.chatWithAI(message);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error("Lỗi chat:", error);
    res.status(500).json({ success: false, message: "Lỗi server hoặc API OpenAI" });
  }
});
router.post("/buyMultiple", async (req, res) => {
  try {
    const { items } = req.body; // items: [{productId, quantity}, ...]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách items không hợp lệ" });
    }

    await productsController.buyMultiple(items);
    res.status(200).json({ success: true, message: "Trừ số lượng thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
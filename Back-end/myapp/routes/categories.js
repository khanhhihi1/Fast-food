const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoriesController.js");
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
router.get("/", async (req, res) => {
  try {
    const result = await categoryController.getAllCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/active", async (req, res) => {
  try {
    const result = await categoryController.getActiveCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy danh mục đã ẩn
router.get("/hidden", async (req, res) => {
  try {
    const result = await categoryController.getHiddenCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.getDetailCate(id);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm danh mục có ảnh
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const data = req.body;

    // Nếu có upload file ảnh thì gắn đường dẫn
    if (req.file) {
      data.image = `/images/${req.file.filename}`;
    }

    const result = await categoryController.addCate(data);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật danh mục có ảnh
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (req.file) {
      data.imageUrl = `/images/${req.file.filename}`;
    }

    const result = await categoryController.updateCate(id, data);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


router.patch("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.hideCate(id);
    return res.status(200).json({
      success: true,
      message: "Ẩn danh mục thành công",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể ẩn danh mục",
    });
  }
});
router.patch("/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.restoreCate(id);
    return res.status(200).json({
      success: true,
      message: "Khôi phục danh mục thành công",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể khôi phục danh mục",
    });
  }
});

module.exports = router;
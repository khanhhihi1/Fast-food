const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoriesController.js");

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

router.post("/add", async (req, res) => {
  try {
    const data = req.body;
    const result = await categoryController.addCate(data);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await categoryController.updateCate(id, data);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
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
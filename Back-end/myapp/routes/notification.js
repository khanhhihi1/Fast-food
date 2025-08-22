const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

// Lấy danh sách thông báo
router.get("/", async (req, res) => {
  try {
    const { userId, type, limit, page } = req.query;
    const result = await notificationController.getNotifications({
      userId,
      type,
      limit: parseInt(limit) || 20,
      page: parseInt(page) || 1,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Đánh dấu thông báo là đã đọc
router.put("/markAsRead/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationController.markAsRead(id);
    res.status(200).json({
      success: true,
      result,
      message: "Đã đánh dấu thông báo là đã đọc",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Tạo thông báo hệ thống (dành cho admin)
router.post("/system", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await notificationController.createNotification({
      message,
      type: "system",
    });
    res.status(201).json({
      success: true,
      result,
      message: "Tạo thông báo hệ thống thành công",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

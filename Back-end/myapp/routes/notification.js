const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController.js");

// Lấy danh sách thông báo theo user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await notificationController.getNotificationsByUser(userId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Lấy tất cả thông báo hệ thống
router.get("/system", async (req, res) => {
  try {
    const result = await notificationController.getSystemNotifications();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

// Tạo thông báo mới
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const result = await notificationController.createNotification(data);
    res
      .status(201)
      .json({ success: true, result, message: "Tạo thông báo thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Đánh dấu đã đọc
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationController.markAsRead(id);
    res
      .status(200)
      .json({ success: true, result, message: "Đã đánh dấu thông báo" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Xoá thông báo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationController.deleteNotification(id);
    res
      .status(200)
      .json({ success: true, result, message: "Xoá thông báo thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

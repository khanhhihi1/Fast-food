const mongoose = require("mongoose");
const Notification = require("../model/notificationModel");

// Lấy tất cả thông báo của một user hoặc thông báo hệ thống
async function getNotifications({ userId, type, limit = 20, page = 1 }) {
  try {
    const query = {};
    if (type === "user" && userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("ID người dùng không hợp lệ");
      }
      query.userId = new mongoose.Types.ObjectId(userId);
      query.type = "user";
    } else if (type === "system") {
      query.type = "system";
    } else {
      throw new Error("Loại thông báo không hợp lệ");
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error.message);
    throw new Error(error.message || "Không thể lấy danh sách thông báo");
  }
}

// Đánh dấu thông báo là đã đọc
async function markAsRead(notificationId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new Error("ID thông báo không hợp lệ");
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error("Thông báo không tồn tại");
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  } catch (error) {
    console.error("Lỗi khi đánh dấu thông báo:", error.message);
    throw new Error(error.message || "Không thể đánh dấu thông báo");
  }
}

// Tạo thông báo mới
async function createNotification({ userId, message, type }) {
  try {
    if (!message || !type || !["user", "system"].includes(type)) {
      throw new Error("Dữ liệu thông báo không hợp lệ");
    }
    if (type === "user" && !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }

    const notification = new Notification({
      userId: type === "user" ? new mongoose.Types.ObjectId(userId) : null,
      message,
      type,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Lỗi khi tạo thông báo:", error.message);
    throw new Error(error.message || "Không thể tạo thông báo");
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
};

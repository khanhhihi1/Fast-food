const notificationModel = require("../model/notificationModel.js");
const mongoose = require("mongoose");
const User = require("../model/userModel.js");

// Tạo thông báo mới
async function createNotification(data) {
  try {
    if (!data.message || !data.type) {
      throw new Error("Thiếu trường bắt buộc: message hoặc type");
    }

    const newNotification = new notificationModel({
      userId: data.userId || null, // Có thể null cho thông báo hệ thống
      title: data.title || "",
      message: data.message,
      type: data.type,
      link: data.link || null,
    });

    const result = await newNotification.save();
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
    throw error;
  }
}

// Lấy danh sách thông báo theo user
async function getNotificationsByUser(userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }
    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông báo:", error.message);
    throw error;
  }
}

async function getNotificationsForAdmins() {
  try {
    // Lấy danh sách tất cả admin
    const admins = await User.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((a) => a._id);

    // Lấy tất cả thông báo có userId thuộc danh sách admin
    const notifications = await notificationModel
      .find({ userId: { $in: adminIds } })
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông báo admin:", error.message);
    throw error;
  }
}

// Lấy tất cả thông báo hệ thống
async function getSystemNotifications() {
  try {
    const notifications = await notificationModel
      .find({ type: "system" })
      .sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông báo hệ thống:", error.message);
    throw error;
  }
}

// Đánh dấu đã đọc
async function markAsRead(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID thông báo không hợp lệ");
    }
    const result = await notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!result) throw new Error("Thông báo không tồn tại");
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi đánh dấu đã đọc:", error.message);
    throw error;
  }
}

// Xoá thông báo
async function deleteNotification(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID thông báo không hợp lệ");
    }
    const result = await notificationModel.findByIdAndDelete(id);
    if (!result) throw new Error("Thông báo không tồn tại");
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi xoá thông báo:", error.message);
    throw error;
  }
}

module.exports = {
  createNotification,
  getNotificationsByUser,
  getNotificationsForAdmins,
  getSystemNotifications,
  markAsRead,
  deleteNotification,
};

const Conversation = require("../model/chatModel"); // Updated path
const User = require("../model/userModel.js");

exports.sendMessage = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ status: "error", message: "Bạn cần đăng nhập để chat" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "Không tìm thấy user" });
    }

    const userId = user._id.toString();
    const userName = user.name || user.username || "User_" + userId.slice(-4); // Lấy từ DB

    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({
        userId,
        userName, // Lưu userName từ DB
        messages: [],
      });
    } else if (conversation.userName !== userName) {
      conversation.userName = userName; // Update nếu thay đổi
    }

    conversation.messages.push({
      sender: "user",
      text: req.body.message, // Sửa: Dùng message thay vì text
      timestamp: new Date(),
    });
    conversation.lastMessage = req.body.message;
    conversation.lastTime = new Date();
    conversation.replied = false;

    await conversation.save();

    res.json({ status: "success", message: "Gửi tin nhắn thành công" });
  } catch (error) {
    console.error("❌ Lỗi sendMessage:", error);
    res.status(500).json({ status: "error", message: "Gửi tin nhắn thất bại" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ status: "error", message: "Bạn cần đăng nhập để xem lịch sử chat" });
    }

    const conversation = await Conversation.findOne({ userId: req.userId });

    if (!conversation) {
      return res.json({ status: "success", result: [], message: "Chưa có tin nhắn" });
    }

    res.json({
      status: "success",
      result: conversation.messages,
      message: "Lấy lịch sử chat thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi getHistory:", error);
    res.status(500).json({ status: "error", message: "Lấy lịch sử chat thất bại" });
  }
};
exports.getContacts = async (req, res) => {
  console.log("Received getContacts request");
  try {
    const convs = await Conversation.find({});
    console.log("Fetched contacts count:", convs.length);

    const mapped = convs.map((conv) => ({
      id: conv.userId,
      name: conv.userName || "Unknown",
      lastMessage: conv.lastMessage || "",
      time: conv.lastTime ? new Date(conv.lastTime).toLocaleTimeString() : "",
      replied: conv.replied,
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error("getContacts error:", error);
    res.status(500).json({ error: "Không thể tải danh sách liên hệ" });
  }
};

exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  console.log("Received getMessages request for userId:", userId);
  try {
    const conv = await Conversation.findOne({ userId });
    if (!conv) {
      console.log("Conversation not found for userId:", userId);
      return res.status(404).json({ error: "Không tìm thấy cuộc trò chuyện" });
    }
    console.log("Fetched messages count:", conv.messages.length);
    res.status(200).json({ messages: conv.messages });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ error: "Không thể tải tin nhắn" });
  }
};

exports.replyMessage = async (req, res) => {
  const { userId } = req.params;
  const { reply } = req.body;
  console.log("Received replyMessage request for userId:", userId, "reply:", reply);
  if (!reply) {
    console.log("Missing reply in replyMessage");
    return res.status(400).json({ error: "Thiếu nội dung trả lời" });
  }

  try {
    const conv = await Conversation.findOne({ userId });
    if (!conv) {
      console.log("Conversation not found for userId:", userId);
      return res.status(404).json({ error: "Không tìm thấy cuộc trò chuyện" });
    }

    conv.messages.push({ sender: "admin", text: reply, timestamp: new Date() });
    conv.lastMessage = reply;
    conv.lastTime = new Date();
    conv.replied = true;
    await conv.save();
    console.log("Reply saved successfully for userId:", userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("replyMessage error:", error);
    res.status(500).json({ error: "Không thể gửi trả lời" });
  }
};
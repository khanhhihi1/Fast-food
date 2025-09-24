// models/conversation.js (fixed model: userId as String, added userName, removed ref)

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "admin"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed to String to match UUID input
    required: true,
    unique: true,
  },
  userName: { // Added to store user name for display in contacts
    type: String,
   required: false, // Fix: Không required để tránh validation fail với data cũ
    default: 'Unknown' // Default nếu thiếu
  },
  messages: [messageSchema],
  lastMessage: { type: String },
  lastTime: { type: Date },
  replied: { type: Boolean, default: false },
});

module.exports = mongoose.model("Conversation", conversationSchema);
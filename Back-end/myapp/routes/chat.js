// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authMiddleware = require("../middleware/authMiddleware");


// User
router.post('/send', authMiddleware, chatController.sendMessage);
router.get('/history', authMiddleware, chatController.getHistory);

// Admin
router.get('/contacts', chatController.getContacts);
router.get('/:userId', chatController.getMessages);
router.post('/:userId/reply', chatController.replyMessage);

module.exports = router;

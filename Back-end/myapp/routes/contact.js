const express = require('express');
const router = express.Router();
const contactController = require('../controller/contacController');

router.post('/send', contactController.sendContact);
router.post('/verify-otp', contactController.verifyOTP);
router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContact);
router.post('/:id/reply', contactController.replyContact);

module.exports = router;

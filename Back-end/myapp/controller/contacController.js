const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Contact = require('../model/contactModel');

// Nodemailer transporter (replace with your email + app password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dongkhanh88888@gmail.com',
        pass: 'hgut emlf kctp poxj',
    },
});

// OTP store tạm (prod thì dùng Redis/session)
const otpStore = new Map();

// Gửi liên hệ kèm OTP
exports.sendContact = async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    otpStore.set(email, { otp, name, subject, message, expires: Date.now() + 300000 }); // 5 phút

    try {
        await transporter.sendMail({
            from: 'info@cuahang.com',
            to: email,
            subject: 'OTP Xác Thực Liên Hệ',
            text: `Mã OTP của bạn là ${otp}. Mã này có hiệu lực trong 5 phút.`,
        });
        res.json({ message: 'OTP đã được gửi đến email của bạn' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Không thể gửi email OTP' });
    }
};

// Xác thực OTP và gửi email đến admin
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    try {
        // Save contact to database
        const contact = new Contact({
            name: stored.name,
            email,
            subject: stored.subject,
            message: stored.message,
        });
        await contact.save();

        // Send email to admin
        await transporter.sendMail({
            from: 'info@cuahang.com',
            to: 'khanhndps38522@gmail.com', // Admin email
            subject: `New Contact Form Submission: ${stored.subject}`,
            text: `Name: ${stored.name}\nEmail: ${email}\nSubject: ${stored.subject}\nMessage: ${stored.message}`,
        });

        otpStore.delete(email);
        res.json({ message: 'Liên hệ đã được gửi thành công đến admin' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Không thể gửi liên hệ' });
    }
};

// Lấy danh sách liên hệ
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(
            contacts.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                lastMessage: c.message.substring(0, 50),
                time: c.createdAt.toLocaleTimeString(),
                replied: c.replied,
            }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Không thể lấy danh sách liên hệ' });
    }
};

// Lấy chi tiết liên hệ
exports.getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ error: 'Không tìm thấy liên hệ' });

        res.json([
            {
                id: contact._id.toString(),
                text: contact.message,
                time: contact.createdAt.toLocaleTimeString(),
                incoming: true,
            },
        ]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Không thể lấy chi tiết liên hệ' });
    }
};

// Phản hồi liên hệ
exports.replyContact = async (req, res) => {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'Nội dung phản hồi là bắt buộc' });

    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ error: 'Không tìm thấy liên hệ' });

        await transporter.sendMail({
            from: 'info@cuahang.com',
            to: contact.email,
            subject: `Phản hồi của khách hàng: ${contact.subject}`,
            text: reply,
        });
        contact.replied = true;
        await contact.save();
        res.json({ message: 'Phản hồi đã được gửi qua email', replied: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Không thể gửi phản hồi' });
    }
};
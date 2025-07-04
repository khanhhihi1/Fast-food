const Voucher = require("../models/voucherModel");

// GET /vouchers - Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isActive: true });
    res.json({
      status: true,
      result: vouchers,
      message: "Lấy danh sách voucher thành công",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      result: null,
      message: "Lỗi khi lấy danh sách voucher",
    });
  }
};

// GET /vouchers/:code - Lấy voucher theo mã
exports.getVoucherByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({
        status: false,
        result: null,
        message: "Voucher không tồn tại hoặc đã hết hạn",
      });
    }

    res.json({
      status: true,
      result: voucher,
      message: "Lấy voucher thành công",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      result: null,
      message: "Lỗi khi tìm voucher",
    });
  }
};

// POST /vouchers - Tạo voucher mới
exports.createVoucher = async (req, res) => {
  try {
    const newVoucher = new Voucher(req.body);
    await newVoucher.save();

    res.json({
      status: true,
      result: newVoucher,
      message: "Đã tạo voucher thành công",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      result: null,
      message: "Lỗi khi tạo voucher: " + error.message,
    });
  }
};

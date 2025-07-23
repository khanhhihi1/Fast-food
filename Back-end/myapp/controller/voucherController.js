const Voucher = require("../model/voucherModel.js");

// GET /vouchers - Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
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

// Tạo voucher mới
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
exports.applyVoucher = async (req, res) => {
  const { code, orderTotal } = req.body;

  try {
    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!voucher) {
      return res.status(404).json({
        status: false,
        result: null,
        message: "Voucher không hợp lệ hoặc đã hết hạn",
      });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        status: false,
        result: null,
        message: `Đơn hàng cần tối thiểu ${voucher.minOrderValue.toLocaleString()}₫ để dùng voucher này.`,
      });
    }

    // Kiểm tra trường bắt buộc
    if (
      !voucher.discountType ||
      voucher.discountValue == null ||
      typeof voucher.discountValue !== "number"
    ) {
      return res.status(400).json({
        status: false,
        result: null,
        message: "Voucher không hợp lệ: thiếu thông tin giảm giá.",
      });
    }

    let discountAmount = 0;

    if (voucher.discountType === "fixed") {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === "percentage") {
      discountAmount = Math.floor((orderTotal * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    }

    const finalTotal = Math.max(orderTotal - discountAmount, 0);

    return res.json({
      status: true,
      result: {
        code: voucher.code,
        discountAmount,
        finalTotal,
      },
      message: "Áp dụng voucher thành công",
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng voucher:", error.message);
    return res.status(500).json({
      status: false,
      result: null,
      message: "Đã xảy ra lỗi khi áp dụng voucher",
    });
  }
};
//  Khôi phục
exports.restoreVoucher = async (req, res) => {
  try {
    const restoredVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!restoredVoucher) {
      return res.status(404).json({
        status: false,
        result: null,
        message: "Không tìm thấy voucher để khôi phục",
      });
    }

    res.json({
      status: true,
      result: restoredVoucher,
      message: "Khôi phục voucher thành công",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      result: null,
      message: "Lỗi khi khôi phục voucher: " + error.message,
    });
  }
};
//  Ẩn voucher
exports.hideVoucher = async (req, res) => {
  try {
    const hiddenVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!hiddenVoucher) {
      return res.status(404).json({
        status: false,
        result: null,
        message: "Không tìm thấy voucher để ẩn",
      });
    }

    res.json({
      status: true,
      result: hiddenVoucher,
      message: "Ẩn voucher thành công",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      result: null,
      message: "Lỗi khi ẩn voucher: " + error.message,
    });
  }
};
// Sửa voucher
exports.updateVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({
        status: false,
        result: null,
        message: "Không tìm thấy voucher để cập nhật",
      });
    }

    res.json({
      status: true,
      result: updatedVoucher,
      message: "Cập nhật voucher thành công",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      result: null,
      message: "Lỗi khi cập nhật voucher: " + error.message,
    });
  }
};


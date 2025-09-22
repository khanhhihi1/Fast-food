const TempOrder = require("../model/tempOrderModel");

module.exports = {
  createTempOrder,
  getTempOrderByUser,
  deleteTempOrder,
  updateShippingInfo,
  updatePaymentMethod,
};

// Tạo đơn tạm thời
async function createTempOrder(req, res) {
  try {
    const userId = req.userId;
    const {
      items,
      total,
      discount,
      voucherCode,
      voucherData,
      shippingInfo,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: false, message: "Giỏ hàng trống" });
    }

    // Xoá đơn cũ nếu có
    await TempOrder.deleteMany({ userId });

    const tempOrder = new TempOrder({
      userId,
      items,
      total,
      discount,
      voucherCode,
      voucherData,
      shippingInfo,
      paymentMethod,
    });

    await tempOrder.save();
    res.json({ status: true, result: tempOrder });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ status: false, message: err.message });
    }

    res.status(500).json({ status: false, message: err.message });
  }
}

// Lấy đơn tạm thời theo user
async function getTempOrderByUser(req, res) {
  try {
    const userId = req.userId;
    const tempOrder = await TempOrder.findOne({ userId });

    if (!tempOrder) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy đơn tạm" });
    }

    res.json({ status: true, result: tempOrder });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}

// Xoá đơn tạm
async function deleteTempOrder(req, res) {
  try {
    const userId = req.userId;
    await TempOrder.deleteMany({ userId });
    res.json({ status: true, message: "Đã xóa đơn tạm" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}

// Cập nhật thông tin giao hàng
async function updateShippingInfo(req, res) {
   try {
    const userId = req.userId;
    const { name, phone, address } = req.body;

    // Validate dữ liệu
    if (!name || !phone || !address) {
      return res.status(400).json({
        status: false,
        message: "Thiếu thông tin giao hàng",
      });
    }

    if (!/^0\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: false,
        message: "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có đúng 10 chữ số)",
      });
    }

    // Tìm TempOrder
    let tempOrder = await TempOrder.findOne({ userId });
    if (!tempOrder) {
      // Nếu chưa có, tạo mới
      tempOrder = new TempOrder({
        userId,
        items: [],
        total: 0,
        shippingInfo: { name, phone, address },
      });
      await tempOrder.save();

      return res.json({
        status: true,
        message: "Tạo đơn hàng tạm thời mới và cập nhật thông tin giao hàng thành công",
        result: tempOrder,
      });
    }

    // Cập nhật thông tin giao hàng
    tempOrder.shippingInfo = { name, phone, address };
    await tempOrder.save();

    res.json({
      status: true,
      message: "Cập nhật thông tin giao hàng thành công",
      result: tempOrder,
    });
  } catch (err) {
    console.error("Error updateShippingInfo:", err);
    res.status(500).json({ status: false, message: err.message });
  }
}

async function updatePaymentMethod(req, res) {
  try {
    const userId = req.userId;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ status: false, message: "Thiếu phương thức thanh toán" });
    }

    const tempOrder = await TempOrder.findOne({ userId });
    if (!tempOrder) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy đơn hàng tạm thời" });
    }

    tempOrder.paymentMethod = paymentMethod;
    await tempOrder.save();

    res.json({
      status: true,
      message: "Cập nhật phương thức thanh toán thành công",
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}

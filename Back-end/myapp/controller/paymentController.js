const crypto = require("crypto");
const axios = require("axios");
const { Order, OrderStatus } = require("../model/orderModel");

const MOMO_CONFIG = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api",
  redirectUrl: "http://localhost:3000/payment-success", // client
  ipnUrl: "http://localhost:5000/api/payment/momo/ipn", // server
};

// 🔹 Tạo thanh toán MoMo
exports.createMomoPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy đơn hàng" });
    }

    const amount = order.total; // ✅ Lấy từ DB
    const requestId = `${orderId}-${Date.now()}`;
    const orderInfo = `Thanh toán đơn hàng #${orderId}`;
    const requestType = "captureWallet";

    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData: "",
      requestType,
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(`${MOMO_CONFIG.endpoint}/create`, body, {
      headers: { "Content-Type": "application/json" },
    });

    res.json({
      status: true,
      payUrl: momoRes.data.payUrl,
      orderId,
      requestId,
    });
  } catch (error) {
    console.error(
      "Lỗi tạo thanh toán MoMo:",
      error.response?.data || error.message
    );
    res.status(500).json({
      status: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// 🔹 Nhận thông báo MoMo callback
exports.momoIpn = async (req, res) => {
  const data = req.body;

  if (data.resultCode === 0) {
    const { orderId, transId } = data;

    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        isPaid: true,
        status: OrderStatus.CONFIRMED,
        momoTransId: transId,
      }
    );

    res.status(200).send("Success");
  } else {
    res.status(400).send("Failed");
  }
};

// 🔹 Hoàn tiền đơn hàng
exports.refundMomo = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order || !order.momoTransId) {
    return res.status(400).json({
      status: false,
      message: "Không tìm thấy giao dịch MoMo để hoàn tiền",
    });
  }

  const requestId = `${orderId}-refund`;
  const amount = order.total;
  const description = `Hoàn tiền đơn hàng #${orderId}`;
  const transId = order.momoTransId;

  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}&transId=${transId}`;

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode: MOMO_CONFIG.partnerCode,
    requestId,
    orderId,
    amount,
    transId,
    lang: "vi",
    description,
    signature,
  };

  try {
    const momoRes = await axios.post(`${MOMO_CONFIG.endpoint}/refund`, body, {
      headers: { "Content-Type": "application/json" },
    });

    res.json({
      status: momoRes.data.resultCode === 0,
      message: momoRes.data.message,
      data: momoRes.data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

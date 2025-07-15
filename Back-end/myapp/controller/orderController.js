const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");
const Order = require("../model/orderModel.js");

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};

// Tạo đơn hàng từ giỏ hàng của người dùng
async function createOrderFromCart(req) {
  const userId = req.userId;

  if (!userId) {
    throw new Error("Không xác định được người dùng.");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống.");
  }

  let total = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);

    if (!product || product.status === false) {
      console.warn(
        `Sản phẩm không hợp lệ hoặc đã ngừng bán: ${item.productId}`
      );
      continue;
    }

    const selectedSize = product.sizes.find((s) => s.name === item.sizeName);
    if (!selectedSize) {
      throw new Error(
        `Kích cỡ '${item.sizeName}' không hợp lệ với sản phẩm '${product.name}'`
      );
    }

    const price = selectedSize.price || { original: item.price.original };
    const finalPrice = price.discount ?? price.original;

    total += finalPrice * item.quantity;

    orderItems.push({
      productId: item.productId,
      name: product.name,
      image: product.image,
      sizeName: item.sizeName,
      taste: item.taste || [],
      quantity: item.quantity,
      price,
      finalPrice,
    });
  }

  if (orderItems.length === 0) {
    throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng.");
  }

  const shippingFee = 15000;
  const tax = Math.round(total * 0.1);
  const grandTotal = total + shippingFee + tax;

  const paymentMethod = req.body.paymentMethod || "cod";

  const newOrder = new Order({
    userId,
    items: orderItems,
    total: grandTotal,
    shippingFee,
    tax,
    paymentMethod,
    status: "Chờ xác nhận",
  });

  await newOrder.save();

  cart.items = [];
  await cart.save();

  return {
    message: "Đặt hàng thành công",
    order: newOrder,
  };
}

// Lấy danh sách đơn hàng của người dùng
async function getUserOrders(req) {
  const userId = req.userId;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return orders;
}

// Lấy tất cả đơn hàng (admin)
async function getAllOrders() {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  return orders;
}

// Cập nhật trạng thái đơn hàng (admin)
async function updateOrderStatus(req) {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return {
    message: "Cập nhật trạng thái thành công",
    order: updated,
  };
}

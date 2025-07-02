const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");
const Order = require("../model/orderModel.js");

// Tạo đơn hàng từ giỏ hàng của người dùng
exports.createOrderFromCart = async (req) => {
  const userId = req.userId;

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống.");
  }

  let total = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const selectedSize = product.sizes.find((s) => s.name === item.sizeName);
    const price = selectedSize?.price || { original: item.price.original };
    const finalPrice = price.discount ?? price.original;

    total += finalPrice * item.quantity;

    orderItems.push({
      productId: item.productId,
      name: product.name,
      image: product.image,
      sizeName: item.sizeName,
      taste: item.taste || [],
      quantity: item.quantity,
      price: price,
      finalPrice: finalPrice,
    });
  }

  const shippingFee = 15000;
  const tax = Math.round(total * 0.1);
  const grandTotal = total + shippingFee + tax;

  const newOrder = new Order({
    userId,
    items: orderItems,
    total: grandTotal,
    shippingFee,
    tax,
    status: "Pending",
  });

  await newOrder.save();

  cart.items = [];
  await cart.save();

  return {
    message: "Đặt hàng thành công",
    order: newOrder,
  };
};

// Lấy danh sách đơn hàng của người dùng
exports.getUserOrders = async (req) => {
  const userId = req.userId;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return orders;
};

// Lấy tất cả đơn hàng (admin)
exports.getAllOrders = async () => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  return orders;
};

// Cập nhật trạng thái đơn hàng (admin)
exports.updateOrderStatus = async (req) => {
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
};

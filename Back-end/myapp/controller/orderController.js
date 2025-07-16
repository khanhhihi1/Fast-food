const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");
const { Order, OrderStatus } = require("../model/orderModel.js");
const TempOrder = require("../model/tempOrderModel.js");

module.exports = {
  createOrderFromCart,
  createOrderFromTempOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
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
    status: OrderStatus.PENDING,
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

  if (!Object.values(OrderStatus).includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return {
    message: "Cập nhật trạng thái thành công",
    order: updated,
  };
}

// Tạo đơn hàng từ TempOrder (sau khi user ấn "Xác nhận đặt hàng")
async function createOrderFromTempOrder(req) {
  const userId = req.userId;
  const tempOrder = await TempOrder.findOne({ userId });

  if (!tempOrder || !tempOrder.items || tempOrder.items.length === 0) {
    throw new Error("Không có đơn hàng tạm thời.");
  }

  const {
    total,
    discount,
    voucherCode,
    voucherData,
    shippingInfo,
    paymentMethod,
  } = tempOrder;

  const enrichedItems = tempOrder.items.map((item) => {
    const original =
      item?.price?.original ?? item?.fullPrice?.original ?? item?.price ?? 0;

    const discountPrice =
      item?.price?.discount ?? item?.fullPrice?.discount ?? undefined;

    const final = item?.finalPrice ?? discountPrice ?? original;

    return {
      productId: item.productId,
      name: item.name,
      image: item.image,
      sizeName: item.sizeName,
      taste: item.taste || [],
      quantity: item.quantity,
      price: {
        original: original,
        discount: discountPrice,
      },
      finalPrice: final,
    };
  });

  const shippingFee = 0;
  const tax = 0;
  const finalTotal = total + shippingFee + tax;

  const newOrder = new Order({
    userId,
    items: enrichedItems,
    total: finalTotal,
    discount,
    voucherCode,
    voucherData,
    shippingInfo,
    paymentMethod,
    shippingFee,
    tax,
    isPaid: paymentMethod === "cod" ? false : undefined,
    status:
      paymentMethod === "cod"
        ? OrderStatus.PENDING
        : OrderStatus.WAITING_PAYMENT,
    createdAt: new Date(),
  });

  await newOrder.save();
  await TempOrder.deleteMany({ userId });

  return {
    message: "Đặt hàng thành công",
    order: newOrder,
  };
}

// Hủy đơn hàng (người dùng)
async function cancelOrder(req) {
  const { id } = req.params;
  const userId = req.userId;

  const order = await Order.findById(id);
  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.userId.toString() !== userId) {
    throw new Error("Không có quyền hủy đơn hàng này");
  }

  if (
    ![OrderStatus.PENDING, OrderStatus.WAITING_PAYMENT].includes(order.status)
  ) {
    throw new Error("Không thể hủy đơn hàng ở trạng thái hiện tại");
  }

  order.status = OrderStatus.CANCELLED;
  await order.save();

  return {
    message: "Hủy đơn hàng thành công",
    order,
  };
}

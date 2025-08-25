const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");
const { Order, OrderStatus } = require("../model/orderModel.js");
const TempOrder = require("../model/tempOrderModel.js");
<<<<<<< HEAD
const Voucher = require("../model/voucherModel.js");
=======

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
module.exports = {
  createOrderFromCart,
  createOrderFromTempOrder,
  getUserOrders,
  getAllOrders,
<<<<<<< HEAD
  getOrderById, 
  updateOrderStatus,
  cancelOrder,
  getOrderStatus,
};

// Function mới: Lấy chi tiết đơn hàng theo ID (cho admin/modal)
async function getOrderById(req) {
  const { id } = req.params;

  let order = await Order.findById(id)
    .populate("userId", "name email")
    .populate({
      path: "items.productId",
      select: "name image",
    });

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  order = order.toObject();
  order.items = order.items.map((item) => {
    let image = item.image || (item.productId ? item.productId.image : "");
    if (image && !image.startsWith("http")) {
      image = `${req.protocol}://${req.get("host")}${image}`;
    }
    return {
      ...item,
      image,
      name: item.productId ? item.productId.name : item.name, 
    };
  });

  // voucherData là embedded, nên đã có sẵn discountValue

  return {
    status: true,
    order,
  };
}

=======
  updateOrderStatus,
  cancelOrder,
};

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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
<<<<<<< HEAD
  let orders = await Order.find({ userId })
    .populate({
      path: "items.productId",
      select: "name image",
    })
    .sort({ createdAt: -1 });

  // Format với prepend URL
  orders = orders.map((order) => {
    const orderDoc = order.toObject();
    orderDoc.items = orderDoc.items.map((item) => {
      let image = item.image || (item.productId ? item.productId.image : "");
      if (image && !image.startsWith("http")) {
        image = `${req.protocol}://${req.get("host")}${image}`;
      }
      return {
        ...item,
        name: item.productId ? item.productId.name : item.name,
        image,
      };
    });
    return orderDoc;
  });

=======
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  return orders;
}

// Lấy tất cả đơn hàng (admin)
<<<<<<< HEAD
async function getAllOrders(req) {
  let orders = await Order.find()
    .populate("userId", "name email")
    .populate({
      path: "items.productId",
      select: "name image",
    })
    .sort({ createdAt: -1 });

  // Format với prepend URL
  orders = orders.map((order) => {
    const orderDoc = order.toObject();
    orderDoc.items = orderDoc.items.map((item) => {
      let image = item.image || (item.productId ? item.productId.image : "");
      if (image && !image.startsWith("http")) {
        image = `${req.protocol}://${req.get("host")}${image}`;
      }
      return {
        ...item,
        image,
      };
    });
    return orderDoc;
  });

=======
async function getAllOrders() {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  return orders;
}

// Cập nhật trạng thái đơn hàng (admin)
async function updateOrderStatus(req) {
  const { id } = req.params;
  const { status } = req.body;

  if (!Object.values(OrderStatus).includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

<<<<<<< HEAD
  let updated = await Order.findByIdAndUpdate(id, { status }, { new: true })
    .populate("userId", "name email")
    .populate({
      path: "items.productId",
      select: "name image",
    });

=======
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  if (!updated) {
    throw new Error("Không tìm thấy đơn hàng");
  }

<<<<<<< HEAD
  // Format với prepend URL
  updated = updated.toObject();
  updated.items = updated.items.map((item) => {
    let image = item.image || (item.productId ? item.productId.image : "");
    if (image && !image.startsWith("http")) {
      image = `${req.protocol}://${req.get("host")}${image}`;
    }
    return {
      ...item,
      image,
    };
  });

  return {
    status: true,
=======
  return {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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

<<<<<<< HEAD
  const enrichedItems = await Promise.all(
    tempOrder.items.map(async (item) => {
      const product = await Product.findById(item.productId); // Fetch product để lấy image chính xác nếu cần

      const original =
        item?.price?.original ?? item?.fullPrice?.original ?? item?.price ?? 0;

      const discountPrice =
        item?.price?.discount ?? item?.fullPrice?.discount ?? undefined;

      const final = item?.finalPrice ?? discountPrice ?? original;

      let image = item.image || (product ? product.image : "");

      if (image && !image.startsWith("http")) {
        image = `${req.protocol}://${req.get("host")}${image}`;
      }

      return {
        productId: item.productId,
        name: item.name,
        image,
        sizeName: item.sizeName,
        taste: item.taste || [],
        quantity: item.quantity,
        price: {
          original: original,
          discount: discountPrice,
        },
        finalPrice: final,
      };
    })
  );
=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

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
<<<<<<< HEAD

// Lấy trạng thái đơn hàng
async function getOrderStatus(req) {
  console.log("Order ID:", req.params.id);
  console.log("User ID:", req.userId);

  const { id } = req.params;
  const userId = req.userId;

  const order = await Order.findById(id);
  if (!order) {
    console.log(`Order not found for ID: ${id}`);
    throw new Error("Không tìm thấy đơn hàng");
  }

  console.log("Order found:", order);

  if (order.userId.toString() !== userId) {
    console.log(
      `Unauthorized access: Order userId ${order.userId} does not match requester ${userId}`
    );
    throw new Error("Không có quyền xem trạng thái đơn hàng này");
  }

  return {
    message: "Lấy trạng thái đơn hàng thành công",
    status: order.status,
    isPaid: order.isPaid, // Thêm trường isPaid
    orderId: order._id,
  };
}
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

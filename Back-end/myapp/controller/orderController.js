// Updated orderController.js (backend controller with changes for isPaid logic)
const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");
const { Order, OrderStatus } = require("../model/orderModel.js");
const TempOrder = require("../model/tempOrderModel.js");
const Voucher = require("../model/voucherModel.js");
const notificationController = require("./notificationController.js");
const productsController = require("../controller/productController.js");
module.exports = {
  createOrderFromCart,
  createOrderFromTempOrder,
  getUserOrders,
  getAllOrders,
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

  return {
    status: true,
    order,
  };
}

// Tạo đơn hàng từ giỏ hàng của người dùng
async function createOrderFromCart(req) {
  const userId = req.userId;
  if (!userId) throw new Error("Không xác định được người dùng.");

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng trống.");

  let total = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status === false) continue;

    const selectedSize = product.sizes.find((s) => s.name === item.sizeName);
    if (!selectedSize) {
      throw new Error(
        `Kích cỡ '${item.sizeName}' không hợp lệ cho '${product.name}'`
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
      shippingInfo,               // 👈 Lưu thẳng vào order
      price,
      finalPrice,
    });
  }

  if (orderItems.length === 0)
    throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng.");

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
    isPaid: paymentMethod !== "cod",
    status: OrderStatus.PENDING,
  });

  await newOrder.save();

  try {
    // 👇 Trừ quantity và cộng soldToday nếu isDaily
    for (const item of newOrder.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      product.quantity -= item.quantity;
      if (product.isDaily) {
        product.soldToday = (product.soldToday || 0) + item.quantity;
      }
      await product.save();
    }
  } catch (subtractError) {
    console.error("❌ Lỗi trừ quantity:", subtractError);
    await Order.findByIdAndDelete(newOrder._id); // rollback
    throw new Error("Tạo order thất bại do cập nhật tồn kho. Đã rollback.");
  }

  cart.items = [];
  await cart.save();

  try {
    await notificationController.createNotification({
      userId,
      title: "Đặt hàng thành công 🎉",
      message: `Đơn hàng #${newOrder._id} đã được tạo thành công.`,
      type: "order",
      link: `/orders/${newOrder._id}`,
    });
  } catch (err) {
    console.error("❌ Không thể tạo thông báo:", err.message);
  }

  return { message: "Đặt hàng thành công", order: newOrder };
}


// Lấy danh sách đơn hàng của người dùng
async function getUserOrders(req) {
  const userId = req.userId;
  let orders = await Order.find({ userId })
    .populate({
      path: "items.productId",
      select: "name image",
    })

    .sort({
      createdAt: -1

    });

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

  return orders;
}

// Lấy tất cả đơn hàng (admin)
async function getAllOrders(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = req.query.filter || 'all';

  let query = {};
  if (filter !== 'all') {
    switch (filter) {
      case 'pending':
        query = { status: { $in: [OrderStatus.PENDING, OrderStatus.WAITING_PAYMENT] } };
        break;
      case 'processing':
        query = { status: { $in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPING] } };
        break;
      case 'completed':
        query = { status: OrderStatus.COMPLETED };
        break;
      case 'cancelled':
        query = { status: OrderStatus.CANCELLED };
        break;
    }
  }

  let allOrders = await Order.find(query)
    .populate("userId", "name email")
    .populate({
      path: "items.productId",
      select: "name image",
    })
    .sort({
      createdAt: 1
    });
  // Use lean for performance

  // Tính toán stats trên tất cả orders filtered
  const stats = {
    totalOrders: allOrders.length,
    actualRevenue: allOrders.reduce((sum, order) => {
      if (order.paymentMethod === 'cod' && !order.isPaid && order.status !== OrderStatus.CANCELLED) {
        return sum + order.total;
      }
      return sum;
    }, 0),
    currentRevenue: allOrders.reduce((sum, order) => {
      if (order.isPaid) {
        return sum + order.total;
      }
      return sum;
    }, 0),
  };

  allOrders = allOrders.sort((a, b) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset về 00:00 hôm nay

  const isToday = (date) => {
    const d = new Date(date);
    return d >= today; // lớn hơn hoặc bằng 00:00 hôm nay
  };

  const getPriority = (order) => {
    // Ưu tiên cao nhất: đơn hôm nay
    if (isToday(order.createdAt)) return -1;

    if (order.status === OrderStatus.PENDING) return 0; 
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) return 2;
    return 1; 
  };

  const priA = getPriority(a);
  const priB = getPriority(b);

  if (priA !== priB) return priA - priB;
  return new Date(a.createdAt) - new Date(b.createdAt);
});


  // Pagination
  const paginatedOrders = allOrders.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(allOrders.length / limit);

  // Format với prepend URL cho paginated orders
  const formattedOrders = paginatedOrders.map((order) => {
    order.items = order.items.map((item) => {
      let image = item.image || (item.productId ? item.productId.image : "");
      if (image && !image.startsWith("http")) {
        image = `${req.protocol}://${req.get("host")}${image}`;
      }
      return {
        ...item,
        image,
      };
    });
    return order;
  });

  return {
    orders: formattedOrders,
    totalPages,
    stats,
  };
}

// Function khôi phục quantity khi hủy đơn hàng
async function restoreQuantity(order) {
  try {
    // Group items by productId and sum quantity
    const productSums = {};
    for (const item of order.items) {
      const pid = item.productId.toString();
      if (!productSums[pid]) productSums[pid] = 0;
      productSums[pid] += item.quantity;
    }

    // Restore quantity for each product
    for (const pid in productSums) {
      const product = await Product.findById(pid);
      if (!product) {
        console.warn(`Sản phẩm ID ${pid} không tồn tại khi khôi phục quantity`);
        continue;
      }
      product.quantity += productSums[pid];
      await product.save();
    }

    console.log(`Đã khôi phục quantity cho đơn hàng ${order._id}`);
  } catch (error) {
    console.error("Lỗi khi khôi phục quantity:", error);
    throw error; // Re-throw để handle ở caller
  }
}

// Cập nhật trạng thái đơn hàng (admin)
async function updateOrderStatus(req) {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  if (!Object.values(OrderStatus).includes(newStatus)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  let order = await Order.findById(id);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  const oldStatus = order.status;

  if (newStatus === OrderStatus.COMPLETED && order.paymentMethod === "cod") {
    order.isPaid = true;
  }

  if (
    newStatus === OrderStatus.CANCELLED &&
    oldStatus !== OrderStatus.CANCELLED
  ) {
    await restoreQuantity(order);
  }

  order.status = newStatus;
  await order.save();

  // 👇 Thêm thông báo theo trạng thái
  let notifyData = null;
  switch (newStatus) {
    case OrderStatus.CONFIRMED:
      notifyData = {
        title: "Đơn hàng đã được xác nhận ✅",
        message: `Đơn hàng #${order._id} đã được xác nhận.`,
      };
      break;
    case OrderStatus.SHIPPING:
      notifyData = {
        title: "Đơn hàng đang giao 🚚",
        message: `Đơn hàng #${order._id} đang trên đường giao.`,
      };
      break;
    case OrderStatus.COMPLETED:
      notifyData = {
        title: "Đơn hàng đã giao thành công 🎉",
        message: `Đơn hàng #${order._id} đã được giao.`,
      };
      break;
    case OrderStatus.CANCELLED:
      notifyData = {
        title: "Đơn hàng đã bị hủy ❌",
        message: `Đơn hàng #${order._id} đã bị hủy.`,
      };
      break;
  }

  if (notifyData) {
    await notificationController.createNotification({
      userId: order.userId,
      title: notifyData.title,
      message: notifyData.message,
      type: "order",
      link: `/orders/${order._id}`,
    });
  }

  let updated = await Order.findById(id)
    .populate("userId", "name email")
    .populate({ path: "items.productId", select: "name image" });

  updated = updated.toObject();
  updated.items = updated.items.map((item) => {
    let image = item.image || (item.productId ? item.productId.image : "");
    if (image && !image.startsWith("http")) {
      image = `${req.protocol}://${req.get("host")}${image}`;
    }
    return { ...item, image };
  });

  return {
    status: true,
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

  const enrichedItems = await Promise.all(
    tempOrder.items.map(async (item) => {
      const product = await Product.findById(item.productId);

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
    isPaid: paymentMethod === "cod" ? false : true,
    status: OrderStatus.PENDING, // có thể điều chỉnh nếu cần
    createdAt: new Date(),
  });

  await newOrder.save();
  try {
    for (const item of newOrder.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      product.quantity -= item.quantity;
      if (product.isDaily) {
        product.soldToday = (product.soldToday || 0) + item.quantity;
      }
      await product.save();
    }
  } catch (subtractError) {
    console.error("❌ Lỗi trừ quantity:", subtractError);
    await Order.findByIdAndDelete(newOrder._id);
    throw new Error("Rollback order do lỗi tồn kho.");
  }
  if (voucherCode) {
    const voucher = await Voucher.findOne({ code: voucherCode });
    if (voucher) {
      voucher.currentUsage = (voucher.currentUsage || 0) + 1;
      await voucher.save();
    }
  }

  await TempOrder.deleteMany({ userId });

  // 👇 Thêm thông báo ở đây
  try {
    await notificationController.createNotification({
      userId,
      title: "Đặt hàng thành công 🎉",
      message: `Đơn hàng #${newOrder._id} đã được tạo thành công.`,
      type: "order",
      link: `/orders/${newOrder._id}`,
    });
  } catch (err) {
    console.error("❌ Không thể tạo thông báo:", err.message);
  }

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
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  if (order.userId.toString() !== userId) {
    throw new Error("Không có quyền hủy đơn hàng này");
  }

  if (order.voucherCode) {
    const voucher = await Voucher.findOne({ code: order.voucherCode });
    if (voucher && voucher.currentUsage > 0) {
      voucher.currentUsage -= 1;
      await voucher.save();
    }
  }

  if (
    ![OrderStatus.PENDING, OrderStatus.WAITING_PAYMENT].includes(order.status)
  ) {
    throw new Error("Không thể hủy đơn hàng ở trạng thái hiện tại");
  }

  await restoreQuantity(order);
  order.status = OrderStatus.CANCELLED;
  await order.save();

  // 👇 Thông báo hủy đơn hàng
  await notificationController.createNotification({
    userId: order.userId,
    title: "Đơn hàng đã bị hủy ❌",
    message: `Đơn hàng #${order._id} đã được hủy.`,
    type: "order",
    link: `/orders/${order._id}`,
  });

  return { message: "Hủy đơn hàng thành công", order };
}

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
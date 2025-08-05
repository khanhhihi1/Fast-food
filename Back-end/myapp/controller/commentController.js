const Comment = require("../model/commentModel.js");
const { Order } = require("../model/orderModel.js");
const mongoose = require("mongoose");
exports.getAllComments = async (req, res) => {
  try {
    const { type } = req.query;

    let filter = {};
    if (type === "product") {
      filter.productId = { $ne: null };
    } else if (type === "order") {
      filter.productId = null;
    }

    const comments = await Comment.find(filter)
      .populate("userId", "name")
      .populate("productId", "name image") // nếu là comment sản phẩm
      .populate("orderId", "_id")
      .select("userId productId orderId comment rating createdAt");

    return res.status(200).json({
      status: true,
      message: comments.length ? "Danh sách bình luận" : "Không có bình luận",
      result: comments,
    });
  } catch (err) {
    console.error("Lỗi khi lấy tất cả bình luận:", err);
    return res.status(500).json({ status: false, message: "Lỗi server", error: err.message });
  }
};
exports.createComment = async (req, res) => {
  try {
    const { userId, orderId, productId, comment, rating } = req.body;

    // Log dữ liệu nhận được
    console.log("Comment Data:", {
      userId,
      orderId,
      productId,
      comment,
      rating,
      commentLength: comment?.length,
      commentType: typeof comment,
    });

    // Kiểm tra các trường bắt buộc
    if (!userId || !orderId || !comment || !rating) {
      return res.status(400).json({ status: false, message: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra tính hợp lệ của ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "User ID không hợp lệ" });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: false, message: "Order ID không hợp lệ" });
    }
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ status: false, message: "Product ID không hợp lệ" });
    }

    // Kiểm tra comment là chuỗi hợp lệ
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ status: false, message: "Bình luận không hợp lệ" });
    }

    // Kiểm tra rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ status: false, message: "Đánh giá phải là số nguyên từ 1 đến 5" });
    }

    // Kiểm tra đơn hàng
    let order;
    try {
      order = await Order.findOne({
        _id: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId),
      });
    } catch (err) {
      console.error("Lỗi khi tìm đơn hàng:", err);
      return res.status(500).json({ status: false, message: "Lỗi khi truy vấn đơn hàng" });
    }

    if (!order) {
      return res.status(404).json({ status: false, message: "Không tìm thấy đơn hàng hoặc không thuộc về người dùng" });
    }

    if (order.status !== 4) {
      return res.status(400).json({ status: false, message: "Chỉ có thể bình luận sau khi hoàn tất đơn hàng" });
    }

    // Kiểm tra sản phẩm (nếu có productId)
    if (productId) {
      const productInOrder = order.items.some(item => {
        try {
          return item.productId &&
                 mongoose.Types.ObjectId.isValid(item.productId) &&
                 item.productId.equals(new mongoose.Types.ObjectId(productId));
        } catch (err) {
          console.error("Lỗi khi kiểm tra productId:", err);
          return false;
        }
      });

      if (!productInOrder) {
        return res.status(400).json({ status: false, message: "Sản phẩm không thuộc đơn hàng" });
      }

      // Kiểm tra đã bình luận sản phẩm chưa
      let existingComment;
      try {
        existingComment = await Comment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          orderId: new mongoose.Types.ObjectId(orderId),
          productId: new mongoose.Types.ObjectId(productId),
        });
      } catch (err) {
        console.error("Lỗi khi kiểm tra bình luận sản phẩm:", err);
        return res.status(500).json({ status: false, message: "Lỗi khi kiểm tra bình luận sản phẩm" });
      }

      if (existingComment) {
        return res.status(400).json({ status: false, message: "Bạn đã bình luận cho sản phẩm này trong đơn hàng" });
      }
    } else {
      // Kiểm tra đã bình luận đơn hàng chưa
      let existingOrderComment;
      try {
        existingOrderComment = await Comment.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          orderId: new mongoose.Types.ObjectId(orderId),
          productId: null,
        });
      } catch (err) {
        console.error("Lỗi khi kiểm tra bình luận đơn hàng:", err);
        return res.status(500).json({ status: false, message: "Lỗi khi kiểm tra bình luận đơn hàng" });
      }

      if (existingOrderComment) {
        return res.status(400).json({ status: false, message: "Bạn đã bình luận cho đơn hàng này" });
      }
    }

    // Tạo bình luận mới
    const newComment = new Comment({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: new mongoose.Types.ObjectId(orderId),
      productId: productId ? new mongoose.Types.ObjectId(productId) : null,
      comment: comment.trim(),
      rating,
      createdAt: new Date(),
    });

    // Lưu bình luận
    try {
      await newComment.save();
    } catch (err) {
      console.error("Lỗi khi lưu bình luận:", err);
      return res.status(500).json({ status: false, message: "Lỗi khi lưu bình luận", error: err.message });
    }

    return res.status(201).json({
      status: true,
      message: "Đã thêm bình luận",
      result: newComment,
    });
  } catch (err) {
    console.error("Lỗi khi tạo bình luận:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    return res.status(500).json({ status: false, message: "Lỗi server", error: err.message });
  }
};

exports.getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Sửa từ req.query thành req.params

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ status: false, message: "Product ID không hợp lệ" });
    }

    const comments = await Comment.find({ productId: new mongoose.Types.ObjectId(productId) })
      .populate("userId", "name")
      .select("userId productId orderId comment rating createdAt");

    return res.status(200).json({
      status: true,
      message: comments.length ? "Danh sách bình luận" : "Chưa có bình luận",
      result: comments,
    });
  } catch (err) {
    console.error("Lỗi khi lấy bình luận:", {
      message: err.message,
      stack: err.stack,
      params: req.params,
    });
    return res.status(500).json({ status: false, message: "Lỗi server", error: err.message });
  }
};

exports.getCommentableProducts = async (req, res) => {
  try {
    const { orderId, userId } = req.query;

    // Log giá trị đầu vào
    console.log("orderId:", orderId, typeof orderId);
    console.log("userId:", userId, typeof userId);

    // Kiểm tra xem orderId và userId có tồn tại
    if (!orderId || !userId) {
      return res.status(400).json({ status: false, message: "Thiếu orderId hoặc userId" });
    }

    // Kiểm tra tính hợp lệ của ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "ID không hợp lệ" });
    }

    // Tìm đơn hàng
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      console.log(`Order not found for orderId: ${orderId}, userId: ${userId}`);
      return res.status(404).json({ status: false, message: "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về người dùng" });
    }

    // Log đơn hàng
    console.log("Order:", JSON.stringify(order, null, 2));

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 4) {
      console.log(`Order status is not COMPLETED: ${order.status}`);
      return res.status(400).json({ status: false, message: "Đơn hàng chưa hoàn tất" });
    }

    // Lấy danh sách sản phẩm từ order.items
    const products = order.items.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image || '',
    }));

    // Log danh sách sản phẩm
    console.log("Products:", JSON.stringify(products, null, 2));

    // Tìm các bình luận đã có
    const commentedProducts = await Comment.find(
      {
        orderId: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      "productId"
    );

    // Log danh sách bình luận
    console.log("Commented Products:", JSON.stringify(commentedProducts, null, 2));

    // Lấy danh sách productId đã được bình luận
    const commentedProductIds = commentedProducts
      .filter(comment => comment.productId) // Chỉ lấy bình luận có productId
      .map(comment => comment.productId.toString());

    // Log danh sách productId đã bình luận
    console.log("Commented Product IDs:", commentedProductIds);

    // Lọc các sản phẩm chưa được bình luận
    const commentableProducts = products.filter(
      product => !commentedProductIds.includes(product.productId.toString())
    );

    // Log danh sách sản phẩm có thể bình luận
    console.log("Commentable Products:", JSON.stringify(commentableProducts, null, 2));

    // Kiểm tra xem đơn hàng đã có bình luận chung chưa (productId: null)
    const hasOrderComment = await Comment.exists({
      orderId: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(userId),
      productId: null,
    });

    // Log trạng thái bình luận đơn hàng
    console.log("Has Order Comment:", hasOrderComment);

    return res.status(200).json({
      status: true,
      message: commentableProducts.length
        ? "Các sản phẩm có thể bình luận"
        : "Không còn sản phẩm nào để bình luận",
      result: commentableProducts,
      canCommentOrder: !hasOrderComment,
    });
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm có thể bình luận:", err.message, err.stack);
    return res.status(500).json({ status: false, message: `Lỗi server: ${err.message}` });
  }
};
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment, rating } = req.body;
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { comment, rating },
      { new: true }
    );
    if (!updated) return res.status(404).json({ status: false, message: "Không tìm thấy bình luận" });
    res.json({ status: true, message: "Đã cập nhật bình luận", result: updated });
  } catch (err) {
    console.error("Lỗi khi cập nhật bình luận:", err);
    res.status(500).json({ status: false, message: "Lỗi server khi cập nhật" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    res.json({ status: true, message: "Đã xóa bình luận" });
  } catch (err) {
    console.error("Lỗi khi xóa bình luận:", err);
    res.status(500).json({ status: false, message: "Lỗi server khi xóa bình luận" });
  }
};
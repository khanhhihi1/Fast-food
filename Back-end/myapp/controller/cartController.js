const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, sizeName, quantity, price, taste } = req.body;

    if (!productId || !sizeName || !price || typeof price.original !== "number") {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, sizeName, quantity: quantity || 1, price, taste }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.sizeName === sizeName &&
          JSON.stringify(item.taste || []) === JSON.stringify(taste || [])
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ productId, sizeName, quantity: quantity || 1, price, taste });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Đã thêm vào giỏ hàng", cart });
  } catch (error) {
    console.error("❌ Lỗi khi thêm giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi thêm vào giỏ hàng", error: error.message });
  }
};


// ✅ Lấy tất cả sản phẩm trong giỏ hàng theo user
exports.getAllCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId").exec();

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    const transformedItems = cart.items.map((item) => ({
      id: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      imageUrl: item.productId.image,
      sizeName: item.sizeName,
      quantity: item.quantity,
      taste: item.taste,
      price: item.price.discount || item.price.original,
    }));

    res.status(200).json({ items: transformedItems });
  } catch (error) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi tải giỏ hàng", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = req.params.id; // itemId là _id của item trong mảng items[]

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    cart.items.splice(itemIndex, 1); // Xóa phần tử tại vị trí tìm thấy
    await cart.save();

    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", cart });
  } catch (error) {
    console.error("❌ Lỗi khi xóa giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi xóa sản phẩm", error: error.message });
  }
};


const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");

const syncCartWithProduct = async (cart) => {
  let isModified = false;
  const updatedItems = await Promise.all(
    cart.items.map(async (item) => {
      try {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.log(`Sản phẩm ${item.productId} không tồn tại, xóa khỏi giỏ hàng`);
          return null;
        }

        let newSizeName = item.sizeName;
        let newPrice = item.price;
        let newTaste = item.taste;

        const isValidSize = product.sizes.some((size) => size.name === item.sizeName);
        if (!isValidSize) {
          console.log(`Kích cỡ ${item.sizeName} không hợp lệ, đặt lại thành ${product.sizes[0]?.name}`);
          newSizeName = product.sizes[0]?.name || item.sizeName;
          const selectedSize = product.sizes.find((size) => size.name === newSizeName);
          newPrice = {
            original: selectedSize?.price.original || item.price.original,
            discount: selectedSize?.price.discount,
          };
          isModified = true;
        } else {
          const selectedSize = product.sizes.find((size) => size.name === item.sizeName);
          if (
            selectedSize.price.original !== item.price.original ||
            (selectedSize.price.discount !== undefined && selectedSize.price.discount !== item.price.discount)
          ) {
            console.log(`Giá không khớp, cập nhật giá cho ${item.sizeName}`);
            newPrice = {
              original: selectedSize.price.original,
              discount: selectedSize.price.discount,
            };
            isModified = true;
          }
        }

        const isValidTaste = item.taste.length === 0 || (item.taste.length === 1 && product.taste?.includes(item.taste[0]));
        if (!isValidTaste && item.taste.length > 0) {
          console.log(`Hương vị ${item.taste} không hợp lệ, đặt lại thành rỗng`);
          newTaste = [];
          isModified = true;
        }

        return {
          ...item.toObject(),
          sizeName: newSizeName,
          taste: newTaste,
          price: newPrice,
        };
      } catch (error) {
        console.error(`Lỗi khi kiểm tra sản phẩm ${item.productId}:`, error);
        return item;
      }
    })
  );

  cart.items = updatedItems.filter((item) => item !== null);
  if (isModified) {
    await cart.save();
    console.log("Giỏ hàng đã được đồng bộ và lưu lại:", cart);
  }

  return cart;
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, sizeName, quantity = 1, price, taste = [] } = req.body;

    if (!productId || !sizeName || !price || typeof price.original !== "number") {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const isValidSize = product.sizes.some((size) => size.name === sizeName);
    if (!isValidSize) {
      return res.status(400).json({ message: `Kích cỡ ${sizeName} không hợp lệ` });
    }

    const isValidTaste = taste.length === 0 || (taste.length === 1 && product.taste?.includes(taste[0]));
    if (!isValidTaste) {
      return res.status(400).json({ message: `Hương vị ${taste[0]} không hợp lệ` });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, sizeName, quantity, price, taste }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.sizeName === sizeName &&
          JSON.stringify(item.taste || []) === JSON.stringify(taste)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, sizeName, quantity, price, taste });
      }
    }

    await cart.save();
    console.log("Request body:", req.body);
    console.log("Saved cart:", cart);
    res.status(200).json({ message: "Đã thêm vào giỏ hàng", cart });
  } catch (error) {
    console.error("❌ Lỗi khi thêm giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi thêm vào giỏ hàng", error: error.message });
  }
};

exports.getAllCart = async (req, res) => {
  try {
    const userId = req.userId;

    let cart = await Cart.findOne({ userId }).populate("items.productId").exec();

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    cart = await syncCartWithProduct(cart);

    const transformedItems = cart.items.map((item) => {
      const product = item.productId || {};
      return {
        id: item._id,
        productId: product._id || item.productId,
        name: product.name || "Sản phẩm không xác định",
        imageUrl: product.image || "",
        sizeName: item.sizeName,
        quantity: item.quantity,
        taste: item.taste || [],
        price: item.price.discount || item.price.original,
        availableSizes: product.sizes || [],
        availableTastes: product.taste || [],
      };
    });

    console.log("Transformed items:", transformedItems);
    res.status(200).json({ items: transformedItems });
  } catch (error) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi tải giỏ hàng", error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, sizeName, price, taste } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (sizeName !== undefined) {
      const isValidSize = product.sizes.some((size) => size.name === sizeName);
      if (!isValidSize) {
        return res.status(400).json({ message: `Kích cỡ ${sizeName} không hợp lệ` });
      }
      item.sizeName = sizeName;
      
      const selectedSize = product.sizes.find((size) => size.name === sizeName);
      item.price = {
        original: selectedSize.price.original,
        discount: selectedSize.price.discount,
      };
    }

    if (taste !== undefined) {
      const isValidTaste = taste.length === 0 || (taste.length === 1 && product.taste?.includes(taste[0]));
      if (!isValidTaste) {
        return res.status(400).json({ message: `Hương vị ${taste[0]} không hợp lệ` });
      }
      item.taste = taste;
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (price !== undefined) {
      item.price = price; 
    }

    await cart.save();
    res.json({ message: "Cập nhật thành công", item });
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = req.params.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", cart });
  } catch (error) {
    console.error("❌ Lỗi khi xóa giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi xóa sản phẩm", error: error.message });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
    cart = await syncCartWithProduct(cart);
    res.status(200).json({ message: "Đã đồng bộ giỏ hàng", cart });
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi đồng bộ giỏ hàng", error: error.message });
  }
};
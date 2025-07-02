const Cart = require("../model/cartModel.js");
const Product = require("../model/productModel.js");

// ✅ Hàm nội bộ đồng bộ giỏ hàng với sản phẩm
const syncCartWithProduct = async (cart) => {
  let isModified = false;
  const updatedItems = await Promise.all(
    cart.items.map(async (item) => {
      try {
        const product = await Product.findById(item.productId);
        if (!product) return null;

        let newSizeName = item.sizeName;
        let newPrice = item.price;
        let newTaste = item.taste;

        const isValidSize = product.sizes.some((size) => size.name === item.sizeName);
        if (!isValidSize) {
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
            newPrice = {
              original: selectedSize.price.original,
              discount: selectedSize.price.discount,
            };
            isModified = true;
          }
        }

        const isValidTaste = item.taste.length === 0 || (item.taste.length === 1 && product.taste?.includes(item.taste[0]));
        if (!isValidTaste && item.taste.length > 0) {
          newTaste = [];
          isModified = true;
        }

        return {
          ...item.toObject(),
          sizeName: newSizeName,
          taste: newTaste,
          price: newPrice,
        };
      } catch {
        return item;
      }
    })
  );

  cart.items = updatedItems.filter((item) => item !== null);
  if (isModified) await cart.save();
  return cart;
};

// ✅ Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req) => {
  const userId = req.userId;
  const { productId, sizeName, quantity = 1, price, taste = [] } = req.body;

  if (!productId || !sizeName || !price || typeof price.original !== "number") {
    throw new Error("Dữ liệu không hợp lệ");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Sản phẩm không tồn tại");

  const isValidSize = product.sizes.some((size) => size.name === sizeName);
  if (!isValidSize) throw new Error(`Kích cỡ ${sizeName} không hợp lệ`);

  const isValidTaste = taste.length === 0 || (taste.length === 1 && product.taste?.includes(taste[0]));
  if (!isValidTaste) throw new Error(`Hương vị ${taste[0]} không hợp lệ`);

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ productId, sizeName, quantity, price, taste }] });
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
  return { message: "Đã thêm vào giỏ hàng", cart };
};

// ✅ Lấy tất cả mục trong giỏ hàng
exports.getAllCart = async (req) => {
  const userId = req.userId;
  let cart = await Cart.findOne({ userId }).populate("items.productId").exec();

  if (!cart) return { items: [] };

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

  return { items: transformedItems };
};


// ✅ Cập nhật một mục trong giỏ hàng
exports.updateCartItem = async (req) => {
  const { id } = req.params;
  const { quantity, sizeName, price, taste } = req.body;

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.id(id);
  if (!item) throw new Error("Item not found");

  const product = await Product.findById(item.productId);
  if (!product) throw new Error("Sản phẩm không tồn tại");

  if (sizeName !== undefined) {
    const isValidSize = product.sizes.some((size) => size.name === sizeName);
    if (!isValidSize) throw new Error(`Kích cỡ ${sizeName} không hợp lệ`);

    item.sizeName = sizeName;
    const selectedSize = product.sizes.find((size) => size.name === sizeName);
    item.price = {
      original: selectedSize.price.original,
      discount: selectedSize.price.discount,
    };
  }

  if (taste !== undefined) {
    const isValidTaste = taste.length === 0 || (taste.length === 1 && product.taste?.includes(taste[0]));
    if (!isValidTaste) throw new Error(`Hương vị ${taste[0]} không hợp lệ`);
    item.taste = taste;
  }

  if (quantity !== undefined) item.quantity = quantity;
  if (price !== undefined) item.price = price;

  await cart.save();
  return { message: "Cập nhật thành công", item };
};

// ✅ Xoá một mục khỏi giỏ hàng
exports.removeFromCart = async (req) => {
  const userId = req.userId;
  const itemId = req.params.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  const index = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (index === -1) throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");

  cart.items.splice(index, 1);
  await cart.save();
  return { message: "Đã xóa sản phẩm khỏi giỏ hàng", cart };
};

// ✅ Đồng bộ giỏ hàng với sản phẩm
exports.syncCart = async (req) => {
  const userId = req.userId;
  let cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  cart = await syncCartWithProduct(cart);
  return { message: "Đã đồng bộ giỏ hàng", cart };
};

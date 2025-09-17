const mongoose = require("mongoose");
const categoriesModel = require("../model/categoriesModel.js");
const productsModel = require("../model/productModel.js");
const notificationController = require("../controller/notificationController");
// const OpenAI = require('openai');
// require('dotenv').config();
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// Lấy tất cả sản phẩm
async function getAllPro() {
  try {
    return await productsModel.find().populate("categoryId");
  } catch (error) {
    console.error(error);
    throw new Error("Lỗi lấy dữ liệu sản phẩm");
  }
}

async function getProductsByCategory(categoryId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("ID danh mục không hợp lệ");
    }

    const objectId = new mongoose.Types.ObjectId(categoryId);
    const products = await productsModel
      .find({ categoryId: objectId })
      .populate("categoryId");

    return products;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    throw new Error("Không thể lấy sản phẩm theo danh mục");
  }
}

// Thêm mới sản phẩm
async function addPro(data, imagePath) {
  try {
    const requiredFields = ["name", "sizes", "categoryId", "quantity", "taste"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Số lượng không được âm");
    }

    const category = await categoriesModel.findById(data.categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    const sizes = data.sizes.map((size) => {
      const original = Number(size.price.original);
      const discount = size.price.discount
        ? Number(size.price.discount)
        : undefined;

      if (isNaN(original) || original <= 0) {
        throw new Error("Thông tin size không hợp lệ");
      }

      return {
        name: size.name,
        price: {
          original,
          ...(discount ? { discount } : {}),
        },
      };
    });

    const newProduct = new productsModel({
      name: data.name,
      categoryId: category._id,
      image: imagePath || "",
      quantity,
      taste: data.taste,
      description: data.description || "",
      status: data.status !== undefined ? data.status : true,
      saleOff: data.saleOff || false,
      time: data.time || "30-45min",
      sizes,
    });

    console.log("👉 Product chuẩn bị lưu:", newProduct);

    const result = await newProduct.save();

    await notificationController.createNotification({
      message: `Sản phẩm mới: ${data.name} vừa được thêm vào danh mục ${category.name}!`,
      type: "system",
    });

    return result;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error.message);
    throw error;
  }
}
// Lấy chi tiết sản phẩm
async function getDatailPro(id) {
  try {
    const result = await productsModel.findById(id).populate("categoryId");
    if (!result) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    result.view = (result.view || 0) + 1;
    await result.save();

    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Lỗi khi lấy chi tiết sản phẩm");
  }
}

// Ẩn sản phẩm
async function hideProduct(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    const product = await productsModel.findById(id);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    const result = await productsModel.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    // Tạo thông báo hệ thống khi ẩn sản phẩm
    await notificationController.createNotification({
      message: `Sản phẩm ${product.name} đã tạm ngưng bán.`,
      type: "system",
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Lỗi khi ẩn sản phẩm");
  }
}

// Hiện sản phẩm
async function showProduct(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    const product = await productsModel.findById(id);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    if (product.status === true) {
      throw new Error("Sản phẩm đã được hiển thị");
    }

    const result = await productsModel.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );

    // Tạo thông báo hệ thống khi hiển thị sản phẩm
    await notificationController.createNotification({
      message: `Sản phẩm ${product.name} đã được hiển thị trở lại.`,
      type: "system",
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Lỗi khi hiển thị sản phẩm");
  }
}

// Cập nhật sản phẩm
async function updateProduct(data, id, imagePath) {
  try {
    const product = await productsModel.findById(id);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const requiredFields = ["name", "sizes", "categoryId", "quantity", "taste"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Số lượng không được âm");
    }

    const category = await categoriesModel.findById(data.categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    const sizes = data.sizes.map((size) => {
      if (
        !size.name ||
        !size.price ||
        typeof size.price.original !== "number"
      ) {
        throw new Error("Thông tin size không hợp lệ");
      }
      return {
        name: size.name,
        price: {
          original: size.price.original,
          discount: size.price.discount || undefined,
        },
      };
    });

    const updateData = {
      name: data.name,
      categoryId: category._id,
      quantity,
      taste: data.taste,
      description: data.description || product.description,
      status: data.status !== undefined ? data.status : product.status,
      saleOff: data.saleOff !== undefined ? data.saleOff : product.saleOff,
      time: data.time || product.time,
      sizes,
    };

    if (imagePath) {
      updateData.image = imagePath; // Cập nhật path ảnh mới nếu có upload
    }

    const result = await productsModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Tạo thông báo hệ thống khi cập nhật sản phẩm
    if (data.saleOff) {
      await notificationController.createNotification({
        message: `Sản phẩm ${data.name} đang có chương trình giảm giá!`,
        type: "system",
      });
    }

    return result;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error.message);
    throw error;
  }
}

// Lấy sản phẩm đang bán
async function getActiveProducts() {
  try {
    const products = await productsModel.find({ status: true });
    return products;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đang bán:", error);
    throw new Error("Không thể lấy danh sách sản phẩm đang bán");
  }
}

// Lấy sản phẩm ngưng bán
async function getInactiveProducts() {
  try {
    const products = await productsModel.find({ status: false });
    return products;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm ngưng bán:", error.message);
    throw new Error("Không thể lấy danh sách sản phẩm ngưng bán");
  }
}
const chatWithAI = async (message) => {
  // Bước 1: Gọi AI để phân tích từ khóa
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Bạn là AI hỗ trợ mua sắm. Phân tích tin nhắn người dùng để extract từ khóa tìm kiếm sản phẩm (ví dụ: 'tôi muốn ăn gà cay' → 'gà cay'). Trả về chỉ từ khóa, không thêm gì khác.",
      },
      { role: "user", content: message },
    ],
    max_tokens: 50,
    temperature: 0.5,
  });

  const query = completion.choices[0].message.content.trim();

  // Bước 2: Tìm sản phẩm trong MongoDB
  const products = await Product.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);

  // Bước 3: Gọi AI để trả lời tự nhiên
  const responsePrompt =
    products.length > 0
      ? `Người dùng hỏi: "${message}". Kết quả: ${products
          .map((p) => `${p.name} - ${p.sizes[0].price.original} VND`)
          .join(", ")}. Hãy trả lời tự nhiên bằng tiếng Việt.`
      : `Người dùng hỏi: "${message}". Không tìm thấy sản phẩm. Trả lời lịch sự bằng tiếng Việt và gợi ý thử từ khóa khác.`;

  const responseCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Bạn là AI chat box thân thiện, trả lời ngắn gọn.",
      },
      { role: "user", content: responsePrompt },
    ],
    max_tokens: 150,
  });

  const aiMessage = responseCompletion.choices[0].message.content;

  return {
    message: aiMessage,
    products: products.length > 0 ? products : null,
  };
};
// Sản phẩm hot
async function getHotProducts() {
  try {
    const result = await productsModel.find({}).sort({ view: -1 }).limit(4);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi lấy sản phẩm hot");
  }
}

// Sản phẩm giảm giá
async function getDiscountProduct() {
  try {
    const productsWithDiscount = await productsModel
      .find({
        status: true,
        saleOff: true,
        sizes: {
          $elemMatch: {
            "price.discount": { $exists: true },
          },
        },
      })
      .limit(5);

    return productsWithDiscount;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    throw new Error("Không thể lấy sản phẩm giảm giá");
  }
}

// Tìm kiếm sản phẩm
function normalizeVietnamese(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function searchProducts(req) {
  try {
    const keyword = req.query.keyword || "";
    const normalizedKeyword = normalizeVietnamese(keyword);
    const regex = new RegExp(normalizedKeyword, "i");
    const products = await productsModel.find({
      $or: [
        { nameNoAccent: regex },
        { descriptionNoAccent: regex },
        { tasteNoAccent: { $in: [regex] } },
      ],
    });

    return products;
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    throw new Error("Không thể tìm kiếm sản phẩm");
  }
}
async function buyMultiple(items) {
  try {
    // Nhóm theo productId và tính tổng quantity
    const productSums = {};
    for (const item of items) {
      const pid = item.productId.toString();
      if (!productSums[pid]) productSums[pid] = { sum: 0, name: "" };
      productSums[pid].sum += item.quantity;
    }

    // Kiểm tra tất cả trước khi trừ (phase 1: check)
    for (const pid in productSums) {
      const product = await productsModel.findById(pid);
      if (!product) {
        throw new Error(`Sản phẩm ID ${pid} không tồn tại`);
      }
      productSums[pid].name = product.name; // Lưu tên để thông báo lỗi
      if (product.quantity < productSums[pid].sum) {
        throw new Error(
          `Không đủ hàng cho sản phẩm ${product.name} (còn ${product.quantity})`
        );
      }
    }

    // Nếu tất cả OK, trừ số lượng (phase 2: subtract)
    for (const pid in productSums) {
      const product = await productsModel.findById(pid);
      product.quantity -= productSums[pid].sum;
      await product.save();

      if (product.quantity === 0) {
        await notificationController.createNotification({
          message: `Sản phẩm ${product.name} đã hết hàng!`,
          type: "system",
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Lỗi khi trừ số lượng multiple:", error);
    throw error;
  }
}
module.exports = {
  getAllPro,
  getDatailPro,
  hideProduct,
  showProduct,
  addPro,
  updateProduct,
  getActiveProducts,
  getInactiveProducts,
  getHotProducts,
  getDiscountProduct,
  searchProducts,
  getProductsByCategory,
  // chatWithAI,
  buyMultiple,
};

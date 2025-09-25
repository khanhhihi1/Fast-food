const mongoose = require("mongoose");
const categoriesModel = require("../model/categoriesModel.js");
const productsModel = require("../model/productModel.js");
const notificationController = require("../controller/notificationController");
const OpenAI = require('openai');
const moment = require('moment');
const cron = require("node-cron"); // ✅ thêm dòng này

require('dotenv').config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// Lấy tất cả sản phẩm
async function getAllPro() {
  try {
    const products = await productsModel.find().populate("categoryId");
    return products.map(p => {
      const plain = p.toObject();

      // Nếu sản phẩm là daily thì check dữ liệu hôm qua
      if (p.isDaily && p.salesHistory?.length > 0) {
        const yesterday = moment().subtract(1, "day").startOf("day");
        const lastRecord = p.salesHistory[p.salesHistory.length - 1];

        if (moment(lastRecord.date).isSame(yesterday, "day")) {
          plain.soldYesterday = lastRecord.sold;
          plain.salesStatus = lastRecord.sold > 10 ? "best" : "slow";
        } else {
          plain.soldYesterday = 0;
          plain.salesStatus = "normal"; // chưa có dữ liệu hôm qua
        }
      } else {
        // Không phải daily thì không có số liệu hôm qua
        plain.soldYesterday = undefined;
        plain.salesStatus = "normal";
      }

      return plain;
    });
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
    const requiredFields = ["name", "sizes", "categoryId", "taste"];
    const isDaily = data.isDaily === "true";
    if (isDaily) {
      requiredFields.push("dailyInitialQuantity");
    } else {
      requiredFields.push("quantity");
    }
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    let quantity;
    let dailyInitialQuantity = 0;
    if (isDaily) {
      dailyInitialQuantity = Number(data.dailyInitialQuantity) || 20;
      if (isNaN(dailyInitialQuantity) || dailyInitialQuantity <= 0) {
        throw new Error("Số lượng ban đầu cho sản phẩm daily phải lớn hơn 0");
      }
      quantity = dailyInitialQuantity;
    } else {
      quantity = Number(data.quantity);
      if (isNaN(quantity) || quantity < 0) {
        throw new Error("Số lượng không được âm");
      }
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
      isDaily,
      dailyInitialQuantity,
      lastResetDate: moment().startOf('day').toDate(),
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

    const requiredFields = ["name", "sizes", "categoryId", "taste"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    const isDaily = data.isDaily === "true";

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
      taste: data.taste,
      description: data.description || product.description,
      status: data.status !== undefined ? data.status : product.status,
      saleOff: data.saleOff !== undefined ? data.saleOff : product.saleOff,
      time: data.time || product.time,
      sizes,
      isDaily,
    };

    if (isDaily) {
      const dailyInit = Number(data.dailyInitialQuantity);
      if (!isNaN(dailyInit) && dailyInit > 0) {
        updateData.dailyInitialQuantity = dailyInit;
      }
    } else {
      updateData.dailyInitialQuantity = 0;
      const qty = Number(data.quantity);
      if (!isNaN(qty) && qty >= 0) {
        updateData.quantity = qty;
      }
    }

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
  const products = await productsModel.find(
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
    const result = await productsModel
      .find({ quantity: { $gt: 0 } }) // chỉ lấy sản phẩm còn hàng
      .sort({ view: -1 })             // sắp xếp theo view giảm dần
      .limit(4);                      // giới hạn 4 sản phẩm

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi lấy sản phẩm hot");
  }
}

// Sản phẩm giảm giá
async function getDiscountProduct() {
  try {
    const productsWithDiscount = await productsModel.aggregate([
      {
        $match: {
          status: true,
          saleOff: true,
          quantity: { $gt: 0 }, // chỉ lấy sản phẩm còn hàng
          "sizes.price.discount": { $exists: true, $ne: null }
        }
      },
      // Lấy ra mức giảm giá lớn nhất trong các size
      {
        $addFields: {
          maxDiscount: { $max: "$sizes.price.discount" }
        }
      },
      // Sắp xếp theo giảm giá cao nhất
      { $sort: { maxDiscount: -1 } },
      // Giới hạn 5 sản phẩm
      { $limit: 5 }
    ]);

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
async function restockProduct(id, quantity) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    const product = await productsModel.findById(id);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const today = moment().startOf("day").toDate();

    // Reset nếu là daily và chưa reset hôm nay
    if (product.isDaily && (!product.lastResetDate || moment(product.lastResetDate).isBefore(today))) {
      await resetProduct(product);
    }

    // Kiểm tra sản phẩm bán chậm dựa vào salesHistory hôm qua
    let isSlowSelling = false;
    if (product.isDaily && product.salesHistory?.length > 0) {
      const yesterday = moment().subtract(1, "day").startOf("day");
      const lastRecord = product.salesHistory[product.salesHistory.length - 1];
      if (moment(lastRecord.date).isSame(yesterday, "day") && lastRecord.sold <= 10) {
        isSlowSelling = true;
      }
    }

    if (isSlowSelling) {
      const maxRestock = 10;

      if (product.quantity >= maxRestock) {
        throw new Error(`${product.name} bán chậm, tồn kho (${product.quantity}). Không thể nhập thêm.`);
      }

      const allowedQuantity = Math.min(quantity, maxRestock - product.quantity);
      product.quantity += allowedQuantity;
    } else {
      // Các sản phẩm khác restock bình thường
      product.quantity += quantity;
    }

    // Cập nhật lastResetDate nếu daily
    if (product.isDaily) {
      product.lastResetDate = today;
    }

    await product.save();

    await notificationController.createNotification({
      message: `Đã nhập liệu ${quantity} cho sản phẩm ${product.name}.`,
      type: "system",
    });

    return product;
  } catch (error) {
    console.error("Lỗi khi nhập liệu:", error.message);
    throw error;
  }
}

// Hàm helper: Reset một sản phẩm daily (dùng cho cron hoặc thủ công)
async function resetProduct(product) {
  if (!product.isDaily) return;

  const today = moment().startOf("day").toDate();
  const yesterday = moment().subtract(1, "day").startOf("day").toDate();

  if (!product.lastResetDate || moment(product.lastResetDate).isBefore(today)) {
    try {
      const leftover = product.quantity;  // Current quantity trước reset
      const sold = Math.max(0, product.dailyInitialQuantity - leftover);

      // 👇 Luôn push salesHistory với sold (kể cả 0)
      product.salesHistory.push({
        date: yesterday,
        sold,
      });

      // 👇 Push leftover nếu >0
      if (leftover > 0) {
        product.leftoverHistory.push({
          date: yesterday,
          leftoverQuantity: leftover
        });
        await notificationController.createNotification({
          message: `Sản phẩm ${product.name} còn dư ${leftover}, chuyển vào bán chậm.`,
          type: "system",
        });
      }

      // Notification dựa trên sold (giữ nguyên)
      if (sold < 10) {
        await notificationController.createNotification({
          message: `Sản phẩm ${product.name} bán chậm (${sold} sp) hôm qua.`,
          type: "system",
        });
      } else if (sold > 10) {
        await notificationController.createNotification({
          message: `Sản phẩm ${product.name} bán chạy (${sold} sp) hôm qua.`,
          type: "system",
        });
      }

      // 👇 FIX: Chỉ reset quantity nếu sold > 10 (auto reset cho best seller)
      if (sold > 10) {
        product.quantity = product.dailyInitialQuantity;
      } // Else: Giữ quantity cho slow seller, cho phép manual restock

      product.lastResetDate = today;
      await product.save();
    } catch (err) {
      console.error(`Lỗi reset sản phẩm ${product.name}:`, err);
      throw err;
    }
  }
}

// Hàm reset toàn bộ daily products
async function resetAllDailyProducts() {
  try {
    const today = moment().startOf("day").toDate();
    const dailyProducts = await productsModel.find({
      isDaily: true,
      $or: [
        { lastResetDate: { $lt: today } },
        { lastResetDate: null }
      ]
    });

    let resetCount = 0;
    for (const product of dailyProducts) {
      await resetProduct(product);
      resetCount++;
    }

    console.log(`✅ Auto reset daily products thành công cho ${resetCount} sản phẩm.`);
    return { resetCount };
  } catch (error) {
    console.error("❌ Lỗi reset daily products:", error);
    throw error;
  }
}

// Lấy list sản phẩm bán chậm cần manual restock
async function getSlowDailyProducts() {
  try {
    const yesterday = moment().subtract(1, "day").startOf("day");
    // 👇 FIX: Không filter lastResetDate != today nữa, để lấy tất cả daily products đã reset hôm nay
    // Và dựa vào history để check sold <=10 hôm qua
    const products = await productsModel.find({ isDaily: true }).populate("categoryId");

    // 👇 FIX: Map như getAllPro để thêm soldYesterday và salesStatus
    return products
      .map(p => {
        const plain = p.toObject();
        let soldYesterday = 0;
        let salesStatus = "normal";
        if (p.salesHistory?.length > 0) {
          const lastRecord = p.salesHistory[p.salesHistory.length - 1];
          if (moment(lastRecord.date).isSame(yesterday, "day")) {
            soldYesterday = lastRecord.sold;
            salesStatus = lastRecord.sold > 10 ? "best" : "slow";
          }
        } else {
          // 👇 Nếu không có history, coi sold=0 → slow
          salesStatus = "slow";
        }
        if (salesStatus === "slow") {
          plain.soldYesterday = soldYesterday;
          plain.salesStatus = "slow";
          return plain; // Chỉ return nếu slow
        }
        // Nếu không có history hoặc không slow, return null để filter
        return null;
      })
      .filter(Boolean); // Loại bỏ null
  } catch (error) {
    console.error("Lỗi lấy slow daily products:", error);
    throw error;
  }
}

// CRON JOB chạy tự động mỗi ngày lúc 00:00
cron.schedule(
  "0 0 * * *", // chạy lúc 15:00 hàng ngày
  async () => {
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`🚀 Cron job reset daily products bắt đầu lúc: ${now}`);
    try {
      const result = await resetAllDailyProducts();
      console.log(`🎉 Hoàn tất reset daily products (${result.resetCount} sản phẩm)`);
    } catch (error) {
      console.error("❌ Lỗi khi reset daily products qua cron:", error);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh", // chạy theo giờ Việt Nam
  }
);
async function getDailyProducts() {
  try {
    const yesterday = moment().subtract(1, "day").startOf("day");
    const products = await productsModel.find({ isDaily: true }).populate("categoryId");

    return products
      .map(p => {
        const plain = p.toObject();
        let soldYesterday = 0;
        if (p.salesHistory?.length > 0) {
          const lastRecord = p.salesHistory[p.salesHistory.length - 1];
          if (moment(lastRecord.date).isSame(yesterday, "day")) {
            soldYesterday = lastRecord.sold;
          }
        }
        plain.soldYesterday = soldYesterday;
        return plain;
      });
  } catch (error) {
    console.error("Lỗi lấy daily products:", error);
    throw error;
  }
}

// Lấy list sản phẩm tồn kho (non-daily)
async function getInventoryProducts() {
  try {
    const products = await productsModel.find({ isDaily: false }).populate("categoryId");
    return products.map(p => p.toObject());
  } catch (error) {
    console.error("Lỗi lấy inventory products:", error);
    throw error;
  }
}
async function restockMultiple(items) { // Hàm mới cho cập nhật multiple
  try {
    for (const { id, qty } of items) {
      if (qty > 0) {
        await restockProduct(id, qty);
      }
    }
    return true;
  } catch (error) {
    console.error("Lỗi restock multiple:", error);
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
  chatWithAI,
  buyMultiple,
  restockProduct,
  resetAllDailyProducts,
  getSlowDailyProducts,
  getInventoryProducts,
  getDailyProducts,
  restockMultiple,
};
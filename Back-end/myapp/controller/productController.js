const categoriesModel = require("../model/categoriesModel.js");
const productsModel = require("../model/productModel.js");
const mongoose = require("mongoose");

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
};

// Lấy tất cả sản phẩm
async function getAllPro() {
  try {
    const products = await productsModel.find().populate("categoryId");
    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Lỗi lấy dữ liệu sản phẩm");
  }
}

// Thêm mới sản phẩm
async function addPro(data) {
  try {
    const requiredFields = [
      "name",
      "sizes",
      "categoryId",
      "quantity",
      "taste",
      "image",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    if (!/^https?:\/\/.+/.test(data.image)) {
      throw new Error("Hình ảnh phải là URL hợp lệ");
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Số lượng không được âm");
    }

    const category = await categoriesModel.findById(data.categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    // Kiểm tra và chuẩn hóa giá từng size
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

    const newProduct = new productsModel({
      name: data.name,
      categoryId: category._id,
      image: data.image,
      quantity,
      taste: data.taste,
      description: data.description || "",
      status: data.status !== undefined ? data.status : true,
      saleOff: data.saleOff || false,
      time: data.time || "30-45min",
      sizes,
    });

    const result = await newProduct.save();
    return result;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error.message);
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

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Lỗi khi hiển thị sản phẩm");
  }
}

// Cập nhật sản phẩm
async function updateProduct(data, id) {
  try {
    const product = await productsModel.findById(id);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const requiredFields = [
      "name",
      "sizes",
      "categoryId",
      "quantity",
      "taste",
      "image",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    if (!/^https?:\/\/.+/.test(data.image)) {
      throw new Error("Hình ảnh phải là URL hợp lệ");
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

    const result = await productsModel.findByIdAndUpdate(
      id,
      {
        name: data.name,
        categoryId: category._id,
        image: data.image,
        quantity,
        taste: data.taste,
        description: data.description || product.description,
        status: data.status !== undefined ? data.status : product.status,
        saleOff: data.saleOff !== undefined ? data.saleOff : product.saleOff,
        time: data.time || product.time,
        sizes,
      },
      { new: true }
    );

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
 // sp hot
async function getHotProducts() {
  try {
    const result = await productsModel
      .find({})                 
      .sort({ view: -1 })       
      .limit(4);               
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi lấy sản phẩm hot");
  }
}
async function getDiscountProduct() {
  try {
    const productsWithDiscount = await productsModel.find({
      status: true,
      saleOff: true,
      sizes: {
        $elemMatch: {
          "price.discount": { $exists: true }
        }
      }
    })
    .limit(5);

    return productsWithDiscount;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    throw new Error("Không thể lấy sản phẩm giảm giá");
  }
}

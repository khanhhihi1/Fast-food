const categoriesModel = require("../model/categoriesModel.js");
const productsModel = require("../model/productModel.js");
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
};
const mongoose = require("mongoose");
async function getAllPro() {
  try {
    const cates = await productsModel.find();
    return cates;
  } catch (error) {
    console.log(error);
    throw new Error("Loi lay du lieu");
  }
}


// Thêm mới sản phẩm
async function addPro(data) {
  try {
    const requiredFields = ["name", "price", "category", "quantity", "taste", "size", "image"];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    if (typeof data.image !== "string" || !/^https?:\/\/.+/.test(data.image)) {
      throw new Error("Hình ảnh phải là URL hợp lệ");
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Số lượng không được âm");
    }

    let parsedPrice;
    if (typeof data.price === "object" && !Array.isArray(data.price)) {
      parsedPrice = {};
      for (const key in data.price) {
        const value = Number(data.price[key]);
        if (isNaN(value) || value <= 0) {
          throw new Error(`Giá cho size "${key}" phải là số dương`);
        }
        parsedPrice[key] = value;
      }
    } else {
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Giá phải là số dương");
      }
      parsedPrice = price;
    }

    const category = await categoriesModel.findById(data.category);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    const newPro = new productsModel({
      name: data.name,
      price: parsedPrice,
      image: data.image,
      quantity: quantity,
      taste: data.taste,
      size: data.size,
      description: data.description || "",
      status: data.status !== undefined ? data.status : true,
      category: category._id,
    });

    const result = await newPro.save();
    return result;

  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error.message);
    throw error;
  }
}




// Sản phẩm chi tiết
async function getDatailPro(id) {
  try {
    // Tìm sản phẩm
    const result = await productsModel.findById(id);

    if (!result) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    // Tăng số lượt xem
    result.view = (result.view || 0) + 1;
    await result.save(); // lưu lại thay đổi

    return result;
  } catch (error) {
    console.log(error);
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
      { status: !product.status },
      { new: true }
    );

    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error.message || "Lỗi khi ẩn sản phẩm");
  }
}

// hiện sản phẩm
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
    console.log(error);
    throw new Error(error.message || "Lỗi khi hiển thị sản phẩm");
  }
}

// Cập nhât sản phẩm
async function updateProduct(data, id) {
  try {
    const pro = await productsModel.findById(id);
    if (!pro) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const requiredFields = ["name", "price", "category", "quantity", "taste", "size", "image"];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    if (typeof data.image !== "string" || !/^https?:\/\/.+/.test(data.image)) {
      throw new Error("Hình ảnh phải là URL hợp lệ");
    }

    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Số lượng không được âm");
    }

    let parsedPrice;
    if (typeof data.price === "object" && !Array.isArray(data.price)) {
      parsedPrice = {};
      for (const key in data.price) {
        const value = Number(data.price[key]);
        if (isNaN(value) || value <= 0) {
          throw new Error(`Giá cho size "${key}" phải là số dương`);
        }
        parsedPrice[key] = value;
      }
    } else {
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Giá phải là số dương");
      }
      parsedPrice = price;
    }

    let categoriesUpdate;
    let categoryId = pro.category;
    if (data.category) {
      const category = await categoriesModel.findById(data.category);
      if (!category) {
        throw new Error("Danh mục không tồn tại");
      }
      categoryId = category._id;
    } else {
      categoriesUpdate = pro.category;
    }

    const result = await productsModel.findByIdAndUpdate(
      id,
      {
        name: data.name,
        price: parsedPrice,
        description: data.description || pro.description || "",
        category: categoryId,
        quantity: quantity,
        image: data.image,
        taste: data.taste,
        size: data.size,
        status: data.status !== undefined ? data.status : pro.status,
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
      .find({})                 // Lấy tất cả sản phẩm
      .sort({ view: -1 })       // Sắp xếp giảm dần theo view
      .limit(4);                // Lấy tối đa 5 sản phẩm
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi lấy sản phẩm hot");
  }
}

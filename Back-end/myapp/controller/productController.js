const categoriesModel = require('../model/categoriesModel.js');
const productsModel = require('../model/productModel.js');
module.exports = { getAllPro, getDatailPro, hideProduct, addPro, updateProduct }
const mongoose = require('mongoose');
// Lấy tất cả sản phẩm 
async function getAllPro() {
  try {
    const cates = await productsModel.find();
    return cates;

  } catch (error) {

    console.log(error);
    throw new Error('Loi lay du lieu')
  }
}
// Thêm mới sản phẩm
async function addPro(data) {
  try {
    const requiredFields = ["name", "price", "categories", "quantity", "taste", "size", "image"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new Error('Giá phải là số dương');
    }
    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      throw new Error('Số lượng không được âm');
    }
    if (typeof data.image !== 'string' || !data.image.match(/^https?:\/\/.+/)) {
      throw new Error('Hình ảnh phải là URL hợp lệ');
    }

    const categoriesFind = await categoriesModel.findById(data.categories);
    if (!categoriesFind) {
      throw new Error("Danh mục không tồn tại");
    }

    const newPro = new productsModel({
      name: data.name,
      price: data.price,
      image: data.image,
      quantity: data.quantity,
      taste: data.taste,
      size: data.size,
      categories: {
        categoriesId: categoriesFind._id,
        categoriesName: categoriesFind.name,
      },
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
    const result = await productsModel.findOne({ _id: id });
    return result;
  }
  catch (errorr) {
    console.log(errorr);
    throw new Error('error')
  };
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

// Cập nhât sản phẩm
async function updateProduct(data, id) {
  try {
    const pro = await productsModel.findById(id);
    if (!pro) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const { name, price, categories, quantity, image, taste, size } = data;

    let categoriesUpdate = pro.categories;

    if (categories) {
      const categoriesFind = await categoriesModel.findById(categories);
      if (!categoriesFind) {
        throw new Error("Danh mục không tồn tại");
      }
      categoriesUpdate = {
        categoriesId: categoriesFind._id,
        categoriesName: categoriesFind.name,
      };
    }
    const result = await productsModel.findByIdAndUpdate(
      id,
      {
        name,
        price,
        categories: categoriesUpdate,
        quantity,
        image,
        taste,
        size,
      },
      { new: true }
    );

    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Lỗi cập nhật sản phẩm");
  }
}

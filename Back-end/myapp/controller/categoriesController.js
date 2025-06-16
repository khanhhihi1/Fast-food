const CategoriesModel = require("../model/categoriesModel");
const productModel = require("../model/productModel");

// Lấy tất cả danh mục
const getAllCate = async () => {
  try {
    const result = await CategoriesModel.find();
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error.message);
    throw new Error("Không thể lấy danh mục");
  }
};

// Lấy chi tiết danh mục theo ID
const getDetailCate = async (id) => {
  try {
    const result = await CategoriesModel.findById(id);
    if (!result) throw new Error("Không tìm thấy danh mục");
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết danh mục:", error.message);
    throw new Error("Không thể lấy chi tiết danh mục");
  }
};

// Thêm danh mục
const addCate = async (data) => {
  try {
    const { name, image } = data;
    const newCate = new CategoriesModel({
      name,
      imageUrl: image,
    });
    const result = await newCate.save();
    return result;
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error.message);
    throw new Error("Không thể thêm danh mục");
  }
};

// Xoá danh mục (kiểm tra nếu có sản phẩm thì không xoá)
const deleteCate = async (id) => {
  try {
    const pros = await productModel.find({ Categories: id });
    if (pros.length > 0) {
      throw new Error("Không thể xoá vì danh mục còn chứa sản phẩm");
    }
    const cate = await CategoriesModel.findByIdAndDelete(id);
    if (!cate) {
      throw new Error("Không tìm thấy danh mục để xoá");
    }
    return cate;
  } catch (error) {
    console.error("Lỗi khi xoá danh mục:", error.message);
    throw new Error(error.message || "Không thể xoá danh mục");
  }
};

// Cập nhật danh mục
const updateCate = async (id, data) => {
  try {
    // updateCate
    const { name, imageUrl } = data;
    const updatedCate = await CategoriesModel.findByIdAndUpdate(
      id,
      { name, imageUrl },
      { new: true }
    );

    if (!updatedCate) {
      throw new Error("Không tìm thấy danh mục để cập nhật");
    }

    return updatedCate;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error.message);
    throw new Error("Không thể cập nhật danh mục");
  }
};

module.exports = {
  getAllCate,
  getDetailCate,
  addCate,
  deleteCate,
  updateCate,
};

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
const getActiveCate = async () => {
  try {
    const result = await CategoriesModel.find({ isHidden: false });
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục đang hoạt động:", error.message);
    throw new Error("Không thể lấy danh mục đang hoạt động");
  }
};

// Lấy danh mục đã ẩn
const getHiddenCate = async () => {
  try {
    const result = await CategoriesModel.find({ isHidden: true });
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục đã ẩn:", error.message);
    throw new Error("Không thể lấy danh mục đã ẩn");
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

const hideCate = async (id) => {
  try {
    // Kiểm tra xem danh mục có sản phẩm không
    const pros = await productModel.find({ categoryId: id });
    if (pros.length > 0) {
      throw new Error("Không thể ẩn vì danh mục còn chứa sản phẩm");
    }

    // Cập nhật trạng thái ẩn thay vì xoá
    const cate = await CategoriesModel.findByIdAndUpdate(
      id,
      { isHidden: true },
      { new: true } // trả về dữ liệu sau khi update
    );

    if (!cate) {
      throw new Error("Không tìm thấy danh mục để ẩn");
    }

    return cate;
  } catch (error) {
    console.error("Lỗi khi ẩn danh mục:", error.message);
    throw new Error(error.message || "Không thể ẩn danh mục");
  }
};
// Cập nhật danh mục
const updateCate = async (id, data) => {
  try {
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
const restoreCate = async (id) => {
  try {
    const cate = await CategoriesModel.findByIdAndUpdate(
      id,
      { isHidden: false },
      { new: true } // trả về bản ghi sau khi update
    );

    if (!cate) {
      throw new Error("Không tìm thấy danh mục để khôi phục");
    }

    return cate;
  } catch (error) {
    console.error("Lỗi khi khôi phục danh mục:", error.message);
    throw new Error(error.message || "Không thể khôi phục danh mục");
  }
};
module.exports = {
  getAllCate,
  getDetailCate,
  addCate,
  hideCate,
  updateCate,
  restoreCate,
  getActiveCate,
  getHiddenCate,
};
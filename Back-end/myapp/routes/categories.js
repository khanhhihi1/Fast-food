const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoriesController.js");
<<<<<<< HEAD

router.get("/", async (req, res) => {
  try {
    const result = await categoryController.getAllCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/active", async (req, res) => {
  try {
    const result = await categoryController.getActiveCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy danh mục đã ẩn
router.get("/hidden", async (req, res) => {
  try {
    const result = await categoryController.getHiddenCate();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
=======
// http://localhost:5000/categories
router.get("/", async (req, res) => {
  try {
    const result = await categoryController.getAllCate();
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/681c9d57bc60e77b1ccbc425
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.getDetailCate(id);
<<<<<<< HEAD
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

=======
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/add
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.post("/add", async (req, res) => {
  try {
    const data = req.body;
    const result = await categoryController.addCate(data);
<<<<<<< HEAD
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

=======
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/update/
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await categoryController.updateCate(id, data);
<<<<<<< HEAD
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/hide/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.hideCate(id);
    return res.status(200).json({
      success: true,
      message: "Ẩn danh mục thành công",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể ẩn danh mục",
    });
  }
});
router.patch("/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.restoreCate(id);
    return res.status(200).json({
      success: true,
      message: "Khôi phục danh mục thành công",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể khôi phục danh mục",
    });
  }
});

module.exports = router;
=======
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/delete/
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.deleteCate(id);
    return res.status(200).json({
      status: true,
      message: "Xóa danh mục thành công",
      result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

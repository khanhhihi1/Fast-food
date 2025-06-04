const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoriesController.js");
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryController.getDetailCate(id);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/add
router.post("/add", async (req, res) => {
  try {
    const data = req.body;
    const result = await categoryController.addCate(data);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});
// http://localhost:5000/categories/update/
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await categoryController.updateCate(id, data);
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

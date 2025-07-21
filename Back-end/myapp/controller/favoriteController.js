const User = require("../model/userModel.js");
const Product = require("../model/productModel.js");
exports.toggleFavorite = async (req, res) => {
    try {
      const userId = req.userId;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ status: false, message: "Người dùng không tồn tại" });

        const index = user.favorites.indexOf(productId);

        if (index === -1) {
            user.favorites.push(productId);
            await user.save();
            return res.json({ status: true, result: null, message: "Đã thêm vào yêu thích" });
        } else {
            user.favorites.splice(index, 1);
            await user.save();
            return res.json({ status: true, result: null, message: "Đã xóa khỏi yêu thích" });
        }
    } catch (error) {
        console.error("toggleFavorite error:", error);
        return res.status(500).json({ status: false, result: null, message: "Lỗi server" });
    }
};

exports.getFavorites = async (req, res) => {
    try {
     const userId = req.userId;


        const user = await User.findById(userId).populate("favorites");

        if (!user) return res.status(404).json({ status: false, result: null, message: "Người dùng không tồn tại" });

        return res.json({
            status: true,
            result: user.favorites,
            message: "Lấy danh sách sản phẩm yêu thích thành công",
        });
    } catch (error) {
        console.error("getFavorites error:", error);
        return res.status(500).json({ status: false, result: null, message: "Lỗi server" });
    }
};

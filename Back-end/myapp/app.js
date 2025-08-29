require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const productRouter = require("./routes/product");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const categoriesRouter = require("./routes/categories");
const voucherRouter = require("./routes/voucher");
const commentRouter = require("./routes/comment");
const tempOrderRoutes = require("./routes/tempOrder");
const paymentRouter = require("./routes/payment");
const favoriteProductRoutes = require("./routes/favoriteProduct");
const notificationRoutes = require("./routes/notification");

const app = express();

// Kết nối MongoDB
mongoose
  .connect("mongodb://localhost:27017/Fried_King")
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ Kết nối MongoDB Atlas thành công!"))
//   .catch((err) => console.error("❌ Lỗi kết nối MongoDB Atlas:", err));

// Cấu hình view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middleware
app.use(cors({ origin: true, credentials: true }));
// app.use(express.json());
// Áp dụng express.json() cho các tuyến đường cụ thể, trừ webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/payment/stripe/webhook") {
    next(); // Bỏ qua express.json() cho webhook
  } else {
    express.json()(req, res, next); // Áp dụng express.json() cho các tuyến đường khác
  }
});
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/comment", commentRouter);
app.use("/voucher", voucherRouter);
app.use("/temp-order", tempOrderRoutes);
app.use("/payment", paymentRouter);
app.use("/favoriteProduct", favoriteProductRoutes);
app.use("/notifications", notificationRoutes);

// Xử lý 404
app.use((req, res, next) => {
  next(createError(404));
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});
// Sau tất cả routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Không tìm thấy endpoint" });
});
module.exports = app;

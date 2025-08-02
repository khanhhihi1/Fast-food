const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const indexRouter = require("./routes/index");
const productRouter = require("./routes/product");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const categoriesRouter = require("./routes/categories");
const voucherRouter = require("./routes/voucher");
const tempOrderRoutes = require("./routes/tempOrder");
const paymentRouter = require("./routes/payment");
const favoriteProductRoutes = require("./routes/favoriteProduct");

const app = express();

// Kết nối MongoDB
mongoose
  .connect("mongodb://localhost:27017/Fried_King")
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Cấu hình view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use("/payment/stripe/webhook", express.raw({ type: "application/json" }));

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
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
app.use("/voucher", voucherRouter);
app.use("/temp-order", tempOrderRoutes);
app.use("/favoriteProduct", favoriteProductRoutes);
app.use("/payment", paymentRouter);

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

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;

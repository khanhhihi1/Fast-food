<<<<<<< HEAD
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
=======
var createError = require("http-errors");
var express = require("express");
var path = require("path");
const cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var productRouter = require("./routes/product");
var usersRouter = require("./routes/users");
var cartRouter = require("./routes/cart");
var orderRouter = require("./routes/order");
var categoriesRouter = require("./routes/categories");
var voucherRouter = require("./routes/voucher");
var tempOrderRoutes = require("./routes/tempOrder");

const mongoose = require("mongoose");

var app = express();

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
mongoose
  .connect("mongodb://localhost:27017/Fried_King")
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
<<<<<<< HEAD
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
=======

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

<<<<<<< HEAD
// Routes
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
<<<<<<< HEAD
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
=======
app.use("/voucher", voucherRouter);
app.use("/temp-order", tempOrderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

<<<<<<< HEAD

=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
module.exports = app;

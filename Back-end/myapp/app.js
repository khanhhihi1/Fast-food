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
var paymentRouter = require("./routes/payment");

const mongoose = require("mongoose");

var app = express();

mongoose
  .connect("mongodb://localhost:27017/Fried_King")
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/voucher", voucherRouter);
app.use("/temp-order", tempOrderRoutes);
app.use("/payment", paymentRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

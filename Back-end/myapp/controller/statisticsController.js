const User = require('../model/userModel');
const { Order } = require("../model/orderModel");
const Product = require('../model/productModel');
const Voucher = require('../model/voucherModel');
const moment = require('moment');

// Hàm tính date range
const getDateRange = (period, startDate, endDate) => {
  let start, end = moment();
  switch (period) {
    case 'day':
      start = moment().startOf('day');
      break;
    case 'week':
      start = moment().startOf('week');
      break;
    case 'month':
      start = moment().startOf('month');
      break;
    case 'year':
    case 'compare_years':
      start = moment().startOf('year');
      break;
    case 'custom':
      if (!startDate || !endDate) throw new Error('startDate và endDate bắt buộc cho tùy chọn custom');
      start = moment(startDate);
      end = moment(endDate);
      break;
    default:
      throw new Error('Period không hợp lệ');
  }
  return { start: start.toDate(), end: end.toDate() };
};

const getDashboardStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate, topPage = 1, topLimit = 10, slowPage = 1, slowLimit = 10 } = req.query;
    const { start, end } = getDateRange(period, startDate, endDate);

    // Total Revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const revenue = totalRevenue[0]?.total || 0;

    // New Users
    const newUsers = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });

    // Cancelled Orders
    const cancelledOrders = await Order.countDocuments({ status: 5, createdAt: { $gte: start, $lte: end } });

    // Vouchers Used
    const vouchersUsed = await Order.countDocuments({ voucherCode: { $exists: true, $ne: null }, createdAt: { $gte: start, $lte: end } });

    // Revenue Chart Data
    const currentYearStart = moment().startOf('year').toDate();
    const revenueByMonth = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: currentYearStart, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let previousRevenueByMonth = [];
    if (period === 'compare_years') {
      const prevYearStart = moment().subtract(1, 'year').startOf('year').toDate();
      const prevYearEnd = moment().subtract(1, 'year').endOf('year').toDate();
      previousRevenueByMonth = await Order.aggregate([
        { $match: { status: 4, createdAt: { $gte: prevYearStart, $lte: prevYearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const revenueData = months.map((month, idx) => {
      const found = revenueByMonth.find(item => item._id.endsWith(`-${String(idx + 1).padStart(2, '0')}`));
      return found ? found.total : 0;
    });

    const previousRevenueData = months.map((month, idx) => {
      const found = previousRevenueByMonth.find(item => item._id.endsWith(`-${String(idx + 1).padStart(2, '0')}`));
      return found ? found.total : 0;
    });

    // Top Selling Products
    const topProductsAgg = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          orderCount: { $addToSet: '$_id' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.finalPrice'] } },
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $addFields: { orderCount: { $size: '$orderCount' } } },
      { $match: { totalSold: { $gte: 30 } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.status': true } },
      { $sort: { orderCount: 1 } },
      { $skip: (topPage - 1) * topLimit },
      { $limit: parseInt(topLimit) },
    ]);

    // Slow Selling Products (bao gồm cả sản phẩm chưa bán)
    const topProductIds = topProductsAgg.map(p => p._id);
    const slowProductsAgg = await Product.aggregate([
      { $match: { status: true, _id: { $nin: topProductIds } } },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.productId", "$$productId"] } } },
            {
              $group: {
                _id: null,
                orderCount: { $addToSet: "$_id" },
                totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.finalPrice"] } },
                totalSold: { $sum: "$items.quantity" },
              },
            },
          ],
          as: "salesData",
        },
      },
      {
        $addFields: {
          orderCount: { $ifNull: [{ $size: { $ifNull: ["$salesData.orderCount", []] } }, 0] },
          totalRevenue: { $ifNull: [{ $arrayElemAt: ["$salesData.totalRevenue", 0] }, 0] },
          totalSold: { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] },
          totalLeftover: { // Thêm metric dư thừa cho daily
            $cond: {
              if: { $eq: ["$isDaily", true] },
              then: { $sum: "$leftoverHistory.leftoverQuantity" }, // Tổng dư thừa lịch sử
              else: 0
            }
          }
        },
      },
      { $sort: { orderCount: 1, totalLeftover: -1 } },
      { $skip: (slowPage - 1) * slowLimit },
      { $limit: parseInt(slowLimit) },
    ]);

    // Top Customers
    const topCustomers = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$userId', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 2 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ]);

    // Top Vouchers
    const topVouchers = await Order.aggregate([
      { $match: { voucherCode: { $ne: null }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$voucherCode', uses: { $sum: 1 }, savings: { $sum: '$discount' } } },
      { $sort: { uses: -1 } },
      { $limit: 2 },
    ]);

    // Previous period for comparisons
    let prevStart, prevEnd;
    let subtractUnit;
    switch (period) {
      case 'day': subtractUnit = 'day'; break;
      case 'week': subtractUnit = 'week'; break;
      case 'month': subtractUnit = 'month'; break;
      case 'year':
      case 'compare_years': subtractUnit = 'year'; break;
      case 'custom':
        const durationDays = moment(end).diff(moment(start), 'days');
        prevStart = moment(start).subtract(durationDays, 'days').toDate();
        prevEnd = moment(end).subtract(durationDays, 'days').toDate();
        break;
    }
    if (subtractUnit) {
      prevStart = moment(start).subtract(1, subtractUnit).toDate();
      prevEnd = moment(end).subtract(1, subtractUnit).toDate();
    }

    const prevRevenueAgg = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const prevRevenue = prevRevenueAgg[0]?.total || 0;
    const revenueChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(0) : 0;

    const prevNewUsers = await User.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
    const newUsersChange = prevNewUsers ? ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(0) : 0;

    const prevCancelled = await Order.countDocuments({ status: 5, createdAt: { $gte: prevStart, $lte: prevEnd } });
    const cancelledChange = prevCancelled ? ((cancelledOrders - prevCancelled) / prevCancelled * 100).toFixed(0) : 0;

    const prevVouchersUsed = await Order.countDocuments({ voucherCode: { $exists: true, $ne: null }, createdAt: { $gte: prevStart, $lte: prevEnd } });
    const vouchersChange = prevVouchersUsed ? ((vouchersUsed - prevVouchersUsed) / prevVouchersUsed * 100).toFixed(0) : 0;

    // Tổng số sản phẩm để phân trang
    const totalTopProductsAgg = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId' } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.status': true } },
      { $count: 'total' },
    ]);
    const totalTopProducts = totalTopProductsAgg[0]?.total || 0;

    const totalSlowProducts = await Product.countDocuments({ status: true });

    res.json({
      totalRevenue: revenue,
      revenueChange: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
      newUsers,
      newUsersChange: `${newUsersChange > 0 ? '+' : ''}${newUsersChange}%`,
      cancelledOrders,
      cancelledChange: `${cancelledChange > 0 ? '+' : ''}${cancelledChange}%`,
      vouchersUsed,
      vouchersChange: `${vouchersChange > 0 ? '+' : ''}${vouchersChange}%`,
      revenueChart: {
        labels: months,
        data: revenueData,
        ...(period === 'compare_years' ? { previousData: previousRevenueData } : {}),
      },
      topProducts: topProductsAgg.map(p => ({
        name: p.product.name,
        revenue: p.totalRevenue,
        sold: p.totalSold,
        orderCount: p.orderCount,
        image: p.product.image || 'http://static.photos/retail/200x200/default',
      })),
      topProductsTotal: totalTopProducts,
      slowProducts: slowProductsAgg.map(p => ({
        name: p.name,
        revenue: p.totalRevenue,
        sold: p.totalSold,
        orderCount: p.orderCount,
        image: p.image || 'http://static.photos/retail/200x200/default',
      })),
      slowProductsTotal: totalSlowProducts || 0,
      topCustomers: topCustomers.map(c => ({
        name: c.user.name,
        spent: c.totalSpent,
        orders: c.orderCount,
        image: 'https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg',
      })),
      topVouchers: topVouchers.map(v => ({
        code: v._id,
        uses: v.uses,
        savings: v.savings,
      })),
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
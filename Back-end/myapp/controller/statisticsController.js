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
    const revenueByMonth = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: moment().startOf('year').toDate(), $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const revenueData = months.map((month, idx) => {
      const found = revenueByMonth.find(item => item._id.endsWith(`-${String(idx + 1).padStart(2, '0')}`));
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
      { $sort: { orderCount: -1 } },
      { $skip: (topPage - 1) * topLimit },
      { $limit: parseInt(topLimit) },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
    ]);

    // Slow Selling Products (bao gồm cả sản phẩm chưa bán)
    const slowProductsAgg = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { status: 4 } },
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
        },
      },
      { $sort: { orderCount: 1 } },
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
    const topVouchers = await Voucher.aggregate([
      { $sort: { uses: -1 } },
      { $limit: 2 },
    ]);

    // Previous period for comparisons
    const duration = moment(end).diff(moment(start), 'days') + 1;
    const prevStart = moment(start).subtract(duration, 'days').toDate();
    const prevEnd = moment(start).subtract(1, 'millisecond').toDate();
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
    const totalTopProducts = await Order.aggregate([
      { $match: { status: 4, createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId' } },
      { $count: 'total' },
    ]);
    const totalSlowProducts = await Product.countDocuments();

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
      },
      topProducts: topProductsAgg.map(p => ({
        name: p.product.name,
        revenue: p.totalRevenue,
        sold: p.totalSold,
        orderCount: p.orderCount,
        image: p.product.image || 'http://static.photos/retail/200x200/default',
      })),
      topProductsTotal: totalTopProducts[0]?.total || 0,
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
        code: v.code,
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

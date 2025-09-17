const express = require('express');
const { getDashboardStats } = require('../controller/statisticsController');

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
  console.log('Reached /statistics/dashboard route');
  getDashboardStats(req, res, next);
});
module.exports = router;

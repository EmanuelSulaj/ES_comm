const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const mongoose = require('mongoose');

// GET: Customers report
router.get('/customers-report', async (req, res) => {
  try {
    const customers = await Order.aggregate([
      // Group by user
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },            // sum of order totals
          orderCount: { $sum: 1 },                        // number of orders
          totalProducts: { $sum: { $sum: '$orderItems.qty' } }, // sum of quantities of all products
          lastPurchase: { $max: '$createdAt' }            // last order date
        }
      },
      // Join with users collection
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // Flatten userDetails array
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      // Select what we want to return
      {
        $project: {
          username: { $ifNull: ['$userDetails.username', 'Unknown User'] },
          email: { $ifNull: ['$userDetails.email', 'No Email'] },
          totalSpent: 1,
          orderCount: 1,
          totalProducts: 1,
          lastPurchase: 1
        }
      },
      // Sort by totalSpent descending
      { $sort: { totalSpent: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Customer report error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});



module.exports = router;

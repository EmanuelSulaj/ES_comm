const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET: Customers report
router.get('/customers-report', async (req, res) => {
  try {
    const customers = await Order.aggregate([
      
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },            
          orderCount: { $sum: 1 },                       
          totalProducts: { $sum: { $sum: '$orderItems.qty' } }, 
          lastPurchase: { $max: '$createdAt' }            
        }
      },
      
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }

      },
      
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
      
      { $sort: { totalSpent: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Customer report error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});


router.get('/dashboard-stats', async (req, res) => {
  try {
    console.log("📊 Fetching Dashboard Stats...");

    // 1. Get Sales Data
    const salesData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);

    // 2. Get counts individually with fail-safes
    const customers = await User.countDocuments({ role: 'user' }).catch(e => {
        console.error("User Count Error:", e.message);
        return 0;
    });

    const orders = await Order.countDocuments().catch(e => {
        console.error("Order Count Error:", e.message);
        return 0;
    });

    const products = await Product.countDocuments().catch(e => {
        console.error("Product Count Error (Is the model imported?):", e.message);
        return 0;
    });

    const result = {
      totalSales: salesData[0]?.totalSales || 0,
      customers,
      orders,
      products
    };

    console.log("✅ Stats compiled:", result);
    res.json(result);

  } catch (error) {
    console.error("❌ CRITICAL DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
});

// GET: Sales trend for the last 7-30 days
router.get('/sales-trend', async (req, res) => {
  try {
    const trend = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }, // Sort chronologically
      { $limit: 30 } // Last 30 days
    ]);

    // Format for Recharts: { date: '2023-10-01', revenue: 120 }
    const formattedData = trend.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orderCount
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/category-distribution', async (req, res) => {
  try {
    // This finds ONE order and shows us what's inside the orderItems
    const sampleOrder = await Order.findOne({ "orderItems.0": { $exists: true } });
    
    if (!sampleOrder) {
      console.log("❌ No orders found with items!");
      return res.json([{ name: "No Orders", value: 0 }]);
    }

    console.log("📝 Sample Order Item:", sampleOrder.orderItems[0]);
    
    // Check if 'product' is actually the name of the ID field
    // Some people use 'productId' or '_id'
    res.json([{ name: "Check Terminal", value: 1 }]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

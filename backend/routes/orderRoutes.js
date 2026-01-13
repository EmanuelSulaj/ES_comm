const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// POST: Save successful order from checkout
router.post('/success', async (req, res) => {
  try {
    const { userId, items, totalAmount, sessionId } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing user or items" });
    }

    const orderItems = items.map(item => ({
      name: item.name,
      qty: item.qty || item.quantity,
      price: item.price,
      image: item.image,
      product: new mongoose.Types.ObjectId(item.productId || item._id)
    }));

    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      orderItems,
      totalAmount: parseFloat(totalAmount),
      paymentStatus: 'Paid',
      stripeSessionId: sessionId
    });

    await newOrder.save();
    res.status(201).json({ message: "Order recorded", order: newOrder });
  } catch (err) {
    console.error("Order Save Error:", err);
    res.status(500).json({ message: "Error saving order", error: err.message });
  }
});



// GET: all orders (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email');
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;

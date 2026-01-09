const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. WEBHOOK ROUTE - MUST be before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('💰 Payment Success:', paymentIntent.id);
        // Add DB fulfillment logic here
    }

    res.json({ received: true });
});

// 2. MIDDLEWARE - After Webhook
app.use(cors()); 
app.use(express.json()); 

// 3. PAYMENT ROUTES

// This is the route your CUSTOM Checkout.jsx uses
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), 
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Payment Intent Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 4. AUTH ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, role: newUser.role } });
    } catch (err) {
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 5. PRODUCT ROUTES
app.get('/api/products', async (req, res) => {
    try {
        // .populate('category') replaces the ID with the actual category document
        const products = await Product.find()
            .populate('category', 'name') // Only get the 'name' from the Category
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Get single product (with category details)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');
            
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ message: "Failed to add product" });
    }
});

// PUT (Update) a product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(400).json({ message: "Failed to update product" });
    }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ message: "Failed to delete product" });
    }
});

// 6. CATEGORY ROUTES
app.get('/api/categories', async (req, res) => {
    try {
        const categoriesWithCounts = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',          // The collection name in MongoDB (usually lowercase plural)
                    localField: '_id',         // The Category's ID
                    foreignField: 'category',  // The field in the Product document
                    as: 'products'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    // Count how many products matched this category ID
                    count: { $size: '$products' } 
                }
            }
        ]);
        res.json(categoriesWithCounts);
    } catch (err) {
        console.error("Aggregation Error:", err);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(500).json({ message: "Failed to add category" });
    }
});

// PUT (Update) a category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        ).lean(); 

        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete category" });
    }
});

// 7. DB CONNECTION & START
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err.message));

app.listen(5000, () => console.log(`🚀 Server running on port 5000`));
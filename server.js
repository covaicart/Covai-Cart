const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');
const session = require('express-session');

const app = express();
const PORT = 3000;
const PRODUCTS_FILE = 'products.json';
const USERS_FILE = 'users.json';
const ORDERS_FILE = 'orders.txt';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

app.use(session({
  secret: 'covai-cart-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ========== 📧 Email Setup ==========
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'nngamingytofficial@gmail.com',
    pass: 'apzsrooqhduhtqde'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ========== 🔐 Signup/Login APIs ==========
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  let users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : [];

  if (users.find(u => u.username === username)) {
    return res.json({ status: 'fail', message: 'User already exists' });
  }

  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ status: 'success', message: 'Signup successful' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : [];

  const match = users.find(u => u.username === username && u.password === password);
  if (match) {
    req.session.loggedIn = true;
    res.json({ status: 'success' });
  } else {
    res.json({ status: 'fail' });
  }
});

app.get('/check-auth', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ status: 'logged out' });
});

// ========== 📩 Contact Form ==========
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log("📩 Contact Form Received:", { name, email, message });
  res.json({ status: 'success', message: 'Message received!' });
});

// ========== 🛒 Order API ==========
app.post('/order', (req, res) => {
  const { customer, cart } = req.body;

  console.log("🛒 New Order Received:");
  console.log("Customer Info:", customer);
  console.log("Cart Items:", cart);

  const orderData = {
    customer,
    cart,
    timestamp: new Date().toISOString()
  };

  fs.appendFile(ORDERS_FILE, JSON.stringify(orderData) + '\n', err => {
    if (err) {
      console.error("❌ Error saving order:", err);
      return res.status(500).json({ status: 'error', message: 'Failed to save order' });
    }
  });

  const orderDetails = cart.map((item, i) =>
    `${i + 1}. ${item.name} - Rs.${item.price}`
  ).join('\n');

  const customerInfo = `
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}
Address: ${customer.address}
  `;

  const mailOptions = {
    from: 'nngamingytofficial@gmail.com',
    to: 'nngamingytofficial@gmail.com',
    subject: '🛒 New Order - Covai Cart',
    text: `New Order Details:\n\nCustomer Info:\n${customerInfo}\n\nItems:\n${orderDetails}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email Error:", error);
    } else {
      console.log('📧 Email sent successfully:', info.response);
    }
  });

  res.json({ status: 'success', message: 'Order placed successfully!' });
});

// ========== 🧰 Admin Product APIs ==========
function loadProducts() {
  const data = fs.readFileSync(PRODUCTS_FILE);
  return JSON.parse(data);
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

app.get('/products', (req, res) => {
  const products = loadProducts();
  res.json(products);
});

app.post('/products', (req, res) => {
  const products = loadProducts();
  const newProduct = req.body;
  newProduct.id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  products.push(newProduct);
  saveProducts(products);
  res.json({ status: 'success' });
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let products = loadProducts();
  products = products.map(p => p.id === id ? { ...p, ...req.body, id } : p);
  saveProducts(products);
  res.json({ status: 'updated' });
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let products = loadProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  res.json({ status: 'deleted' });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Full Server running with login/signup at http://localhost:${PORT}`);
});

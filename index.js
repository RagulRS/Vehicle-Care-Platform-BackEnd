require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const FormDataModel = require('./models/FormData.js');
const ServiceBooking = require('./models/ServiceBooking.js');;

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const jwtSecret = process.env.JWT_SECRET;
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new FormDataModel({
        name,
        email,
        password: hashedPassword
      });
  
      await newUser.save();
      res.json({ message: 'User registered successfully' });
  
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  });
  

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await FormDataModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
  
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  });
  



app.post('/createOrder',  async (req, res) => {
  const amount = req.body.amount;
  const options = {
    amount: amount * 100,
    currency: 'USD',
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/book-service', async (req, res) => {
    const { name, email, phone, service, date } = req.body;
  
    if (!name || !email || !phone || !service || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const newBooking = new ServiceBooking({
        name,
        email,
        phone,
        service,
        date, 
      });
  
      await newBooking.save();
      res.status(201).json({ message: 'Service booked successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while booking the service.' });
    }
  });

app.listen(3001, () => {
  console.log("Server listening on http://127.0.0.1:3001");
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./src/routes/employees');

const app = express();

// UPDATE THIS LINE - Add CORS options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo-0.mongo-svc:27017,mongo-1.mongo-svc:27017,mongo-2.mongo-svc:27017/employeedb?replicaSet=rs0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Employee service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/employees', employeeRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'employee' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Employee service running on port ${PORT}`));

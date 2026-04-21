const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const deptRoutes = require('./src/routes/departments');

const app = express();

// UPDATE THIS - Add CORS options (same as employee backend)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo-0.mongo-svc:27017/employeedb';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Department service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/departments', deptRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'department' }));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Department service running on port ${PORT}`));

const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET all employees - FIXED: remove populate since Department model isn't available
router.get('/', async (req, res) => {
  try {
    // Remove .populate() since Department model is in different service
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single employee - FIXED
router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create employee
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    // 🔥 FIX: remove empty or invalid department
    if (!data.department || data.department === "") {
      delete data.department;
    }

    const emp = new Employee(data);
    await emp.save();

    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };

    // 🔥 FIX: handle empty department during update
    if (!data.department || data.department === "") {
      delete data.department;
    }

    const emp = await Employee.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

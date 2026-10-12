const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { query } = require('../config/db');

// Generate JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'smart_quiz_super_secret_jwt_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// User Registration restricted: Only Admin can create users per College Examination Policy
const register = async (req, res, next) => {
  return res.status(403).json({
    success: false,
    message: 'Public self-registration is closed. Student accounts are provisioned exclusively by the Department Administrator.'
  });
};

// User Login (handles both bcrypt hashes and phpMyAdmin plain text passwords)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user in users table
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check password
    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
      if (isMatch) {
        const upgradedHash = await bcrypt.hash(password, 10);
        await query('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, user.id]);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile
const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }
    const users = await UserModel.findAll();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// Admin: Create User directly
const createUserByAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { name, email, password, role, class_name, section } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const assignedRole = ['admin', 'student'].includes(role) ? role : 'student';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      class_name: class_name || '',
      section: section || 'A'
    });

    res.status(201).json({
      success: true,
      message: `User created successfully with role "${assignedRole}".`,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

// Admin & Faculty: Update User details
const updateUserByAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin or Teacher access required.' });
    }

    const { id } = req.params;
    const { name, role, class_name, section } = req.body;

    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await UserModel.update(id, { name, role, class_name, section });
    res.status(200).json({
      success: true,
      message: 'User details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete User
const deleteUserByAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await UserModel.delete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk Create Users from CSV
const bulkCreateUsersByAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'A valid array of users is required.' });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    const createdUsers = [];

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const name = (u.name || '').trim();
      const email = (u.email || '').trim().toLowerCase();
      const password = (u.password || '').trim() || 'student123';
      const role = u.role === 'admin' ? 'admin' : 'student';

      if (!name || !email) {
        skippedCount++;
        errors.push(`Row ${i + 1}: Name and email are required.`);
        continue;
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${email}): Email already registered.`);
        continue;
      }

      const userRole = u.role === 'admin' ? 'admin' : 'student';
      const className = (u.class_name || u.class || '').trim();
      const sectionName = (u.section || 'A').trim().toUpperCase();

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        class_name: className,
        section: sectionName
      });
      createdUsers.push(newUser);
      createdCount++;
    }

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${createdCount} created, ${skippedCount} skipped.`,
      createdCount,
      skippedCount,
      errors,
      users: createdUsers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  bulkCreateUsersByAdmin,
  deleteUserByAdmin
};

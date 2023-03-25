const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./user');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

    // Return token
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    // Return token
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (err) {
    next(err);
  }
};

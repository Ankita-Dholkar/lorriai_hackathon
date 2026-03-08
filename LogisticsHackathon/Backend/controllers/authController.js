import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Generate Token and Set Cookie
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  })

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // Required for sameSite: 'none'
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role, companyName } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({
      fullName,
      email,
      password,
      mobile,
      role,
      companyName: companyName || undefined,
    })

    if (user) {
      generateToken(res, user._id)
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        companyName: user.companyName,
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error('Registration Error:', error.message)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id)
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        companyName: user.companyName,
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    console.error('Login Error:', error.message)
    res.status(500).json({ message: 'Server error during login' })
  }
}

// @desc    Get user profile (example protected route)
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user) {
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        companyName: user.companyName,
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

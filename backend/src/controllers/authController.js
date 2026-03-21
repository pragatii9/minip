import Admin from '../models/Admin.js'
import { sendTokenResponse } from '../middleware/auth.js'

/**
 * @route   POST /api/admin/login
 * @desc    Login admin
 * @access  Public
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    })
  }

  try {
    // Check for user
    const admin = await Admin.findOne({ email }).select('+password')

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    sendTokenResponse(admin, 200, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    })
  }
}

/**
 * @route   POST /api/admin/register
 * @desc    Register new admin
 * @access  Public (first admin only in production)
 */
export const register = async (req, res, next) => {
  const { name, email, password, institute } = req.body

  // Validation
  if (!name || !email || !password || !institute) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    })
  }

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email })

    if (admin) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Create admin
    admin = await Admin.create({
      name,
      email,
      password,
      institute,
    })

    sendTokenResponse(admin, 201, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    })
  }
}

/**
 * @route   GET /api/admin/me
 * @desc    Get current logged in admin
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        institute: req.admin.institute,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin
 * @access  Private
 */
export const logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}

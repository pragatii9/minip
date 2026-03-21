import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

export const protect = async (req, res, next) => {
  let token

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = await Admin.findById(decoded.id)

    if (!req.admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }
}

export const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

export const sendTokenResponse = (admin, statusCode, res) => {
  const token = getToken(admin._id)

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      institute: admin.institute,
    },
  })
}

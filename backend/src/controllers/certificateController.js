import Certificate from '../models/Certificate.js'
import {
  generateFileHash,
  generateCertificateId,
  compareHashes,
} from '../utils/hashUtils.js'
import { generateQRCode, generateQRData } from '../utils/qrCodeUtils.js'
import { saveFile, fileExists, readFileBuffer } from '../utils/fileUtils.js'
import {
  validateCertificateType,
  validateEmail,
  validateDate,
} from '../utils/validators.js'

/**
 * @route   POST /api/certificate/upload
 * @desc    Upload and register a new certificate
 * @access  Private
 */
export const uploadCertificate = async (req, res, next) => {
  try {
    const {
      recipientName,
      recipientEmail,
      certificateType,
      course,
      issueDate,
      expiryDate,
    } = req.body

    // Validation
    if (!recipientName || !recipientEmail || !certificateType || !course || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a certificate file',
      })
    }

    // Validate certificate type
    if (!validateCertificateType(certificateType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate type',
      })
    }

    // Validate email
    if (!validateEmail(recipientEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      })
    }

    // Validate dates
    if (!validateDate(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue date',
      })
    }

    if (expiryDate && !validateDate(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date',
      })
    }

    // Save file
    const filePath = saveFile(req.file.buffer, req.file.originalname)

    // Generate file hash
    const fileHash = await generateFileHash(filePath)

    // Generate certificate ID
    const certificateId = generateCertificateId()

    // Generate QR data
    const qrData = generateQRData(certificateId, fileHash, req.admin.email)

    // Generate QR code
    const qrCode = await generateQRCode(qrData)

    // Create certificate document
    const certificate = await Certificate.create({
      certificateId,
      adminId: req.admin._id,
      recipientName,
      recipientEmail,
      certificateType,
      course,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      fileName: req.file.originalname,
      filePath,
      fileHash,
      fileSize: req.file.size,
      qrCode,
      metadata: {
        issuerName: req.admin.institute,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        course: certificate.course,
        fileHash: certificate.fileHash,
        qrCode: certificate.qrCode,
        createdAt: certificate.createdAt,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading certificate',
      error: error.message,
    })
  }
}

/**
 * @route   POST /api/certificate/verify
 * @desc    Verify a certificate (by file or certificate ID)
 * @access  Public
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    let certificate = null
    let calculatedHash = null

    // Verify by file upload
    if (req.file) {
      // Generate hash from uploaded file
      const tempFilePath = saveFile(req.file.buffer, req.file.originalname)
      calculatedHash = await generateFileHash(tempFilePath)

      // Find certificate by hash
      certificate = await Certificate.findOne({ fileHash: calculatedHash })
        .populate('adminId', 'institute email')
        .exec()
    }
    // Verify by certificate ID
    else if (req.body.certificateId) {
      const { certificateId } = req.body
      certificate = await Certificate.findOne({ certificateId })
        .populate('adminId', 'institute email')
        .exec()

      if (certificate && req.file) {
        calculatedHash = await generateFileHash(tempFilePath)
      }
    }

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        result: 'NOT_FOUND',
      })
    }

    // Check expiry status
    let status = 'valid'
    if (certificate.expiryDate && new Date() > new Date(certificate.expiryDate)) {
      status = 'expired'
    } else if (certificate.status === 'revoked') {
      status = 'revoked'
    }

    // If file was uploaded, compare hashes
    let hashMatch = true
    if (calculatedHash) {
      hashMatch = compareHashes(calculatedHash, certificate.fileHash)
    }

    const isValid = hashMatch && status === 'valid'

    // Update verification record
    await Certificate.findByIdAndUpdate(
      certificate._id,
      {
        $inc: { 'verifications.count': 1 },
        'verifications.lastVerified': new Date(),
        $push: {
          'verifications.details': {
            timestamp: new Date(),
            result: isValid ? 'valid' : 'tampered',
          },
        },
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      result: isValid ? 'VALID' : hashMatch ? 'EXPIRED_OR_REVOKED' : 'TAMPERED',
      data: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        course: certificate.course,
        certificateType: certificate.certificateType,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        issuer: certificate.metadata.issuerName,
        issuerEmail: certificate.adminId.email,
        status,
        hashValid: hashMatch,
        verifications: certificate.verifications.count + 1,
        issuedAt: certificate.createdAt,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message,
    })
  }
}

/**
 * @route   GET /api/certificate/records
 * @desc    Get all certificates for logged in admin
 * @access  Private
 */
export const getRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query

    let query = { adminId: req.admin._id }

    // Add search filter
    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
      ]
    }

    // Add status filter
    if (status) {
      query.status = status
    }

    const startIndex = (page - 1) * limit
    const total = await Certificate.countDocuments(query)

    const certificates = await Certificate.find(query)
      .select('-filePath -qrCode')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      count: certificates.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      data: certificates,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message,
    })
  }
}

/**
 * @route   GET /api/certificate/stats
 * @desc    Get certificate statistics for logged in admin
 * @access  Private
 */
export const getStats = async (req, res, next) => {
  try {
    const total = await Certificate.countDocuments({ adminId: req.admin._id })
    const active = await Certificate.countDocuments({
      adminId: req.admin._id,
      status: 'active',
    })
    const expired = await Certificate.countDocuments({
      adminId: req.admin._id,
      status: 'expired',
    })
    const revoked = await Certificate.countDocuments({
      adminId: req.admin._id,
      status: 'revoked',
    })

    // Total verifications
    const verificationData = await Certificate.aggregate([
      { $match: { adminId: req.admin._id } },
      { $group: { _id: null, totalVerifications: { $sum: '$verifications.count' } } },
    ])

    const totalVerifications = verificationData[0]?.totalVerifications || 0

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        expired,
        revoked,
        totalVerifications,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    })
  }
}

/**
 * @route   DELETE /api/certificate/:id
 * @desc    Revoke a certificate
 * @access  Private
 */
export const revokeCertificate = async (req, res, next) => {
  try {
    const { id } = req.params

    const certificate = await Certificate.findOne({
      _id: id,
      adminId: req.admin._id,
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }

    certificate.status = 'revoked'
    await certificate.save()

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking certificate',
      error: error.message,
    })
  }
}

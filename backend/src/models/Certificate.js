import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    recipientName: {
      type: String,
      required: [true, 'Please provide recipient name'],
      trim: true,
    },
    recipientEmail: {
      type: String,
      required: [true, 'Please provide recipient email'],
      lowercase: true,
    },
    certificateType: {
      type: String,
      enum: ['Bachelor', 'Master', 'Diploma', 'Internship', 'Course', 'Other'],
      required: [true, 'Please specify certificate type'],
    },
    course: {
      type: String,
      required: [true, 'Please provide course/subject name'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Please provide issue date'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    qrCode: {
      type: String, // Base64 encoded QR code
      required: true,
    },
    verifications: {
      count: {
        type: Number,
        default: 0,
      },
      lastVerified: {
        type: Date,
        default: null,
      },
      details: [
        {
          timestamp: Date,
          result: String, // 'valid' or 'tampered'
        },
      ],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
    metadata: {
      issuerName: String,
      signatureUrl: String,
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
certificateSchema.index({ adminId: 1, createdAt: -1 })
certificateSchema.index({ certificateId: 1 })
certificateSchema.index({ fileHash: 1 })

export default mongoose.model('Certificate', certificateSchema)

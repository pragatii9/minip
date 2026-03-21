import QRCode from 'qrcode'

/**
 * Generate QR code as data URL
 * @param {Object} qrData - Data to encode in QR code
 * @returns {Promise<string>} Base64 encoded QR code
 */
export const generateQRCode = async (qrData) => {
  try {
    const qrString = JSON.stringify(qrData)
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    })
    return qrCodeImage
  } catch (error) {
    console.error(`Error generating QR code: ${error.message}`)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR data object
 * @param {string} certificateId - Certificate ID
 * @param {string} hash - File hash
 * @param {string} adminEmail - Admin email
 * @returns {Object} QR code data
 */
export const generateQRData = (certificateId, hash, adminEmail) => {
  return {
    certificateId,
    hash,
    issuer: adminEmail,
    timestamp: new Date().toISOString(),
    verifyUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify`,
  }
}

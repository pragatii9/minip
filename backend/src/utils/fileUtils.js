import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

/**
 * Ensure upload directory exists
 */
export const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Save uploaded file
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Original file name
 * @returns {string} Saved file path
 */
export const saveFile = (fileBuffer, fileName) => {
  ensureUploadDir()
  
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueFileName = `${Date.now()}_${sanitizedFileName}`
  const filePath = path.join(UPLOAD_DIR, uniqueFileName)
  
  fs.writeFileSync(filePath, fileBuffer)
  return filePath
}

/**
 * Delete file
 * @param {string} filePath - Path to file to delete
 * @returns {boolean} True if deleted successfully
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`)
    return false
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {boolean} True if file exists
 */
export const fileExists = (filePath) => {
  return fs.existsSync(filePath)
}

/**
 * Get file size
 * @param {string} filePath - Path to file
 * @returns {number} File size in bytes
 */
export const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    console.error(`Error getting file size: ${error.message}`)
    return 0
  }
}

/**
 * Read file as buffer
 * @param {string} filePath - Path to file
 * @returns {Buffer} File content as buffer
 */
export const readFileBuffer = (filePath) => {
  return fs.readFileSync(filePath)
}

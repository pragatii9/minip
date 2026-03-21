/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return emailRegex.test(email)
}

/**
 * Validate certificate type
 * @param {string} type - Certificate type
 * @returns {boolean} True if valid
 */
export const validateCertificateType = (type) => {
  const validTypes = ['Bachelor', 'Master', 'Diploma', 'Internship', 'Course', 'Other']
  return validTypes.includes(type)
}

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Max allowed size in bytes
 * @returns {boolean} True if valid
 */
export const validateFileSize = (fileSize, maxSize = 5242880) => {
  return fileSize <= maxSize
}

/**
 * Validate file type
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if valid
 */
export const validateFileType = (mimeType) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  return allowedTypes.includes(mimeType)
}

/**
 * Validate date format
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if valid
 */
export const validateDate = (date) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

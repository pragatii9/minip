import multer from 'multer'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880

// Configure storage
const storage = multer.memoryStorage()

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png']
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png']

  const fileExt = path.extname(file.originalname).toLowerCase()
  const fileMime = file.mimetype

  if (allowedMimes.includes(fileMime) && allowedExts.includes(fileExt)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})

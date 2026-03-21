import express from 'express'
import {
  uploadCertificate,
  verifyCertificate,
  getRecords,
  getStats,
  revokeCertificate,
} from '../controllers/certificateController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Protected routes (require admin login)
router.post('/upload', protect, upload.single('certificate'), uploadCertificate)
router.get('/records', protect, getRecords)
router.get('/stats', protect, getStats)
router.delete('/:id', protect, revokeCertificate)

// Public routes (no authentication required)
router.post('/verify', upload.single('certificate'), verifyCertificate)

export default router

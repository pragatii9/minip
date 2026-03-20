import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Download, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import FileUpload from '../components/FileUpload'
import { Card, CardBody, CardHeader } from '../components/Card'
import { useToast } from '../contexts/ToastContext'
import { certificateAPI } from '../services/api'
import { CERTIFICATE_TYPES } from '../utils/constants'
import { generateCertificateId, copyToClipboard, downloadFile } from '../utils/helpers'
import QRCode from 'qrcode'

const UploadCertificate = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    type: CERTIFICATE_TYPES[0],
    date: '',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (file) => {
    setFormData(prev => ({
      ...prev,
      file
    }))
  }

  const generateQRCode = async (text) => {
    try {
      return await QRCode.toDataURL(text)
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.file) {
      showToast('Please select a certificate file', 'error')
      return
    }

    if (!formData.name || !formData.date) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)

    try {
      const certificateId = generateCertificateId()
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('date', formData.date)
      formDataToSend.append('certificateId', certificateId)

      const response = await certificateAPI.upload(formDataToSend)
      const { hash, certificateId: returnedId } = response.data

      // Generate QR code
      const qrCodeUrl = await generateQRCode(returnedId)
      
      setUploadResult({
        certificateId: returnedId,
        hash: hash,
        qrCode: qrCodeUrl,
        name: formData.name,
        type: formData.type,
        date: formData.date
      })

      showToast('Certificate uploaded successfully!', 'success')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = async () => {
    const success = await copyToClipboard(uploadResult.certificateId)
    if (success) {
      showToast('Certificate ID copied to clipboard!', 'success')
    } else {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleDownloadQR = () => {
    if (uploadResult.qrCode) {
      const link = document.createElement('a')
      link.download = `certificate-${uploadResult.certificateId}-qr.png`
      link.href = uploadResult.qrCode
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('QR code downloaded!', 'success')
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      type: CERTIFICATE_TYPES[0],
      date: '',
      file: null
    })
    setUploadResult(null)
  }

  if (uploadResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-success-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Certificate Uploaded Successfully
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your certificate has been processed and is ready for verification
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certificate Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Certificate Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Certificate ID
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                          {uploadResult.certificateId}
                        </code>
                        <Button variant="ghost" size="sm" onClick={handleCopyId}>
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        SHA-256 Hash
                      </label>
                      <code className="block w-full p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm mt-1 break-all">
                        {uploadResult.hash}
                      </code>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Recipient Name
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {uploadResult.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Certificate Type
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {uploadResult.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Issue Date
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {uploadResult.date}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Verification QR Code
                  </h3>
                  <div className="text-center">
                    {uploadResult.qrCode && (
                      <img
                        src={uploadResult.qrCode}
                        alt="QR Code"
                        className="mx-auto mb-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
                      />
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Scan this QR code to verify the certificate
                    </p>
                    <Button onClick={handleDownloadQR} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <Button onClick={handleReset} variant="outline">
                  Upload Another Certificate
                </Button>
                <Button onClick={() => navigate('/admin/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Certificate
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload a new certificate to the verification system
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Recipient Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter recipient's full name"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certificate Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {CERTIFICATE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Issue Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate File
                  <span className="text-error-500 ml-1">*</span>
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || !formData.file}
                  className="flex-1"
                >
                  {loading ? 'Uploading...' : 'Upload Certificate'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default UploadCertificate

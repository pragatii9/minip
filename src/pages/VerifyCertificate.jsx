import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../components/Button'
import FileUpload from '../components/FileUpload'
import { Card, CardBody, CardHeader } from '../components/Card'
import { useToast } from '../contexts/ToastContext'
import { certificateAPI } from '../services/api'
import { Html5QrcodeScanner } from 'html5-qrcode'

const VerifyCertificate = () => {
  const { showToast } = useToast()
  const [verificationMethod, setVerificationMethod] = useState('file') // 'file' or 'qr'
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const qrScannerRef = useRef(null)
  const scannerRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResult(null)
  }

  const verifyCertificate = async () => {
    if (!file) {
      showToast('Please select a certificate file', 'error')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await certificateAPI.verify(formData)
      setResult(response.data)
      
      if (response.data.valid) {
        showToast('Certificate verified successfully!', 'success')
      } else {
        showToast('Certificate verification failed', 'error')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.'
      showToast(errorMessage, 'error')
      setResult({
        valid: false,
        message: errorMessage,
        details: null
      })
    } finally {
      setLoading(false)
    }
  }

  const startQRScanner = () => {
    setScanning(true)
    setResult(null)

    setTimeout(() => {
      if (!qrScannerRef.current) return

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      )

      scannerRef.current.render(
        async (decodedText) => {
          try {
            const response = await certificateAPI.verify({ certificateId: decodedText })
            setResult(response.data)
            stopQRScanner()
            
            if (response.data.valid) {
              showToast('Certificate verified successfully!', 'success')
            } else {
              showToast('Certificate verification failed', 'error')
            }
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Verification failed'
            showToast(errorMessage, 'error')
            setResult({
              valid: false,
              message: errorMessage,
              details: null
            })
            stopQRScanner()
          }
        },
        (errorMessage) => {
          console.error('QR scan error:', errorMessage)
        }
      )
    }, 100)
  }

  const stopQRScanner = () => {
    setScanning(false)
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
  }

  const resetVerification = () => {
    setFile(null)
    setResult(null)
    stopQRScanner()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Certificate
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Verify the authenticity of a certificate using file upload or QR code scanning
            </p>
          </CardHeader>
          <CardBody>
            {/* Verification Method Selection */}
            <div className="flex space-x-4 mb-6">
              <Button
                variant={verificationMethod === 'file' ? 'primary' : 'outline'}
                onClick={() => {
                  setVerificationMethod('file')
                  stopQRScanner()
                }}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={verificationMethod === 'qr' ? 'primary' : 'outline'}
                onClick={() => {
                  setVerificationMethod('qr')
                  setFile(null)
                  setResult(null)
                }}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            </div>

            {/* File Upload Section */}
            {verificationMethod === 'file' && (
              <div className="space-y-6">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024}
                />

                {file && (
                  <div className="flex space-x-4">
                    <Button
                      onClick={verifyCertificate}
                      loading={loading}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Verifying...' : 'Verify Certificate'}
                    </Button>
                    <Button variant="outline" onClick={resetVerification}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* QR Scanner Section */}
            {verificationMethod === 'qr' && (
              <div className="space-y-6">
                {!scanning ? (
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      QR Code Scanner
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Click the button below to start scanning QR codes
                    </p>
                    <Button onClick={startQRScanner}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Scanning QR Code...
                      </h3>
                      <Button variant="outline" size="sm" onClick={stopQRScanner}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                    <div id="qr-reader" ref={qrScannerRef} className="rounded-lg overflow-hidden" />
                  </div>
                )}
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <div className={`p-6 rounded-lg border-2 ${
                  result.valid
                    ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                    : 'border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${
                      result.valid ? 'bg-success-500' : 'bg-error-500'
                    }`}>
                      {result.valid ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        result.valid
                          ? 'text-success-800 dark:text-success-200'
                          : 'text-error-800 dark:text-error-200'
                      }`}>
                        {result.valid ? '✅ Certificate is VALID' : '❌ Certificate is INVALID'}
                      </h3>
                      <p className={`mt-1 ${
                        result.valid
                          ? 'text-success-600 dark:text-success-300'
                          : 'text-error-600 dark:text-error-300'
                      }`}>
                        {result.message}
                      </p>

                      {result.details && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Certificate Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Certificate ID:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.details.certificateId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Recipient Name:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.details.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Type:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.details.type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Issue Date:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.details.date}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Status:
                              </span>
                              <span className={`text-sm font-medium ${
                                result.details.status === 'verified'
                                  ? 'text-success-600 dark:text-success-400'
                                  : 'text-error-600 dark:text-error-400'
                              }`}>
                                {result.details.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <Button onClick={resetVerification} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Verify Another Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default VerifyCertificate

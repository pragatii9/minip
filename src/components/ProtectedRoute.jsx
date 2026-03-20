import React from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

export default ProtectedRoute

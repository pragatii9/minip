import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import UploadCertificate from './pages/UploadCertificate'
import VerifyCertificate from './pages/VerifyCertificate'
import RecordsPage from './pages/RecordsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>

              {/* Public Routes */}
              <Route index element={<LandingPage />} />
              <Route path="admin/login" element={<AdminLogin />} />

              {/* 🔥 TEMP: REMOVE PROTECTION FOR TESTING */}
              <Route path="admin/upload" element={<UploadCertificate />} />

              {/* Protected Routes */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="records" element={
                <ProtectedRoute>
                  <RecordsPage />
                </ProtectedRoute>
              } />

              {/* ✅ FIXED VERIFY ROUTES */}
              <Route path="verify" element={<VerifyCertificate />} />
              <Route path="verify/:id" element={<VerifyCertificate />} />

            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
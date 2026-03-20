import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, Shield, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import Button from './Button'

const Header = () => {
  const { darkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = localStorage.getItem('adminToken')

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/')
  }

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CertVerify
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 ${
                location.pathname === '/' ? 'text-primary-600 dark:text-primary-400' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/verify"
              className={`text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 ${
                location.pathname === '/verify' ? 'text-primary-600 dark:text-primary-400' : ''
              }`}
            >
              Verify
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 ${
                  isAdminRoute ? 'text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            ) : (
              <Link to="/admin/login">
                <Button variant="outline" size="sm">
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

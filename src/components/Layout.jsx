import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import { useTheme } from '../contexts/ThemeContext'

const Layout = () => {
  const { darkMode } = useTheme()

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

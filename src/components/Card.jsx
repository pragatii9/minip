import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  ...props
}) => {
  const baseClasses = 'rounded-xl shadow-lg border'
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105 transition-all duration-300' : ''
  const glassClasses = glass ? 'glass-morphism' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  
  const classes = `${baseClasses} ${glassClasses} ${hoverClasses} ${className}`

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
)

const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

export { Card, CardHeader, CardBody, CardFooter }

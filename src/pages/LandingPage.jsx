import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, Upload, CheckCircle, ArrowRight } from 'lucide-react'
import Button from '../components/Button'
import { Card, CardBody } from '../components/Card'

const LandingPage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Verification',
      description: 'Advanced cryptographic hashing ensures certificate authenticity'
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Quick Verification',
      description: 'Verify certificates instantly using QR codes or file upload'
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Easy Management',
      description: 'Admin dashboard for seamless certificate upload and management'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Certificates Verified' },
    { number: '99.9%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Availability' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Certificate
              <span className="text-primary-600 dark:text-primary-400"> Verification</span>
              <br />
              System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Secure, fast, and reliable certificate verification platform. 
              Protect your credentials with advanced blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/verify">
                <Button size="lg" className="flex items-center space-x-2">
                  <Search size={20} />
                  <span>Verify Certificate</span>
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="lg">
                  Admin Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose CertVerify?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides the most secure and efficient way to verify certificates
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardBody className="text-center">
                    <div className="text-primary-600 dark:text-primary-400 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600 dark:bg-primary-800">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations that trust CertVerify for their certificate verification needs
            </p>
            <Link to="/verify">
              <Button size="lg" variant="secondary">
                Verify Your First Certificate
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

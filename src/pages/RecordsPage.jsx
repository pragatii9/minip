import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { Card, CardBody, CardHeader } from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../contexts/ToastContext'
import { certificateAPI } from '../services/api'
import { formatDate, debounce } from '../utils/helpers'
import { STATUS_OPTIONS } from '../utils/constants'

const RecordsPage = () => {
  const { showToast } = useToast()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const recordsPerPage = 10

  useEffect(() => {
    fetchRecords()
  }, [currentPage, searchTerm, statusFilter])

  const debouncedSearch = debounce((term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, 500)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: recordsPerPage,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter
      }

      const response = await certificateAPI.getRecords(params)
      const { records: recordsData, pagination } = response.data

      setRecords(recordsData || [])
      setTotalPages(pagination?.totalPages || 1)
      setTotalRecords(pagination?.total || 0)
    } catch (error) {
      console.error('Failed to fetch records:', error)
      showToast('Failed to fetch records', 'error')
      // Set demo data for development
      const demoRecords = [
        {
          id: 'ABC123456789',
          name: 'John Doe',
          type: 'Academic',
          date: '2024-01-15',
          status: 'verified'
        },
        {
          id: 'DEF987654321',
          name: 'Jane Smith',
          type: 'Professional',
          date: '2024-01-20',
          status: 'pending'
        },
        {
          id: 'GHI456789123',
          name: 'Bob Johnson',
          type: 'Training',
          date: '2024-01-25',
          status: 'tampered'
        }
      ]
      setRecords(demoRecords)
      setTotalRecords(demoRecords.length)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    debouncedSearch(e.target.value)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status)
    if (!statusOption) return null

    const colorClasses = {
      success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      error: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[statusOption.color]}`}>
        {statusOption.label}
      </span>
    )
  }

  const exportRecords = async () => {
    try {
      const response = await certificateAPI.getRecords({ 
        export: true,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter
      })
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate-records-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showToast('Records exported successfully', 'success')
    } catch (error) {
      showToast('Failed to export records', 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Certificate Records
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage and view all certificate records
                </p>
              </div>
              <Button onClick={exportRecords} className="mt-4 sm:mt-0">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, ID, or type..."
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Records Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No records found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Certificate ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="py-3 px-4">
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {record.id}
                            </code>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {record.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {record.type}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {formatDate(record.date)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Showing {((currentPage - 1) * recordsPerPage) + 1} to{' '}
                      {Math.min(currentPage * recordsPerPage, totalRecords)} of{' '}
                      {totalRecords} records
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default RecordsPage

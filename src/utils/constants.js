export const CERTIFICATE_TYPES = [
  'Academic',
  'Professional',
  'Training',
  'Certification',
  'Other'
]

export const STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'tampered', label: 'Tampered', color: 'error' },
]

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  certificateId: /^[A-Z0-9]{8,16}$/,
}

export const API_ENDPOINTS = {
  ADMIN_LOGIN: '/admin/login',
  CERTIFICATE_UPLOAD: '/certificate/upload',
  CERTIFICATE_VERIFY: '/certificate/verify',
  CERTIFICATE_RECORDS: '/certificate/records',
  CERTIFICATE_STATS: '/certificate/stats',
}

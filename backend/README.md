# Certificate Verification System - Backend API

A secure backend API for a Certificate Authenticity Verification System built with Node.js, Express, MongoDB, and SHA-256 hashing.

## Features

- **Admin Authentication**: JWT-based authentication with secure password hashing
- **Certificate Management**: Upload, verify, and track certificates
- **SHA-256 Hashing**: Cryptographic hashing for certificate verification
- **QR Code Generation**: Automatic QR code generation for each certificate
- **MongoDB Database**: Persistent storage with efficient indexing
- **File Upload**: Secure handling of PDF and image files
- **Verification Records**: Track all verification attempts
- **Admin Dashboard**: Statistics and records management

## API Endpoints

### Authentication Routes (`/api/admin`)

- `POST /login` - Admin login
- `POST /register` - Register new admin
- `GET /me` - Get current admin (Protected)
- `POST /logout` - Admin logout (Protected)

### Certificate Routes (`/api/certificate`)

- `POST /upload` - Upload certificate (Protected)
- `POST /verify` - Verify certificate (Public with optional file)
- `GET /records` - Get all certificates (Protected)
- `GET /stats` - Get dashboard statistics (Protected)
- `DELETE /:id` - Revoke certificate (Protected)

## Installation

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Setup

1. **Clone and install dependencies**

```bash
cd backend
npm install
```

2. **Configure environment variables**

```bash
cp .env.example .env
```

3. **Edit `.env` with your settings**

```env
MONGODB_URI=mongodb://localhost:27017/certificate-verification
PORT=5000
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

4. **Start the server**

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server will run on `http://localhost:5000`

## Database Schema

### Admin Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  institute: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Certificate Model

```javascript
{
  certificateId: String (unique),
  adminId: ObjectId (ref: Admin),
  recipientName: String,
  recipientEmail: String,
  certificateType: String (enum),
  course: String,
  issueDate: Date,
  expiryDate: Date,
  fileName: String,
  filePath: String,
  fileHash: String (SHA-256),
  fileSize: Number,
  qrCode: String (Base64),
  verifications: {
    count: Number,
    lastVerified: Date,
    details: [{timestamp: Date, result: String}]
  },
  status: String (enum: active, expired, revoked),
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## File Upload

### Supported Formats

- PDF (application/pdf)
- JPEG (image/jpeg)
- PNG (image/png)

### Size Limit

- Maximum 5MB per file (configurable via MAX_FILE_SIZE)

### Upload Method

- Multipart form-data with key `certificate`

## SHA-256 Hashing

The system uses SHA-256 for certificate verification:

1. **On Upload**: Calculate SHA-256 hash of the certificate file and store it
2. **On Verification**: Calculate hash of the uploaded file and compare with stored hash
3. **Result**:
   - ✅ **VALID** - Hash matches and certificate is not expired/revoked
   - ❌ **TAMPERED** - Hash doesn't match
   - ⚠️ **EXPIRED_OR_REVOKED** - Hash matches but certificate is no longer active

## QR Code

Each uploaded certificate generates a unique QR code containing:

- Certificate ID
- SHA-256 hash
- Issuer email
- Timestamp
- Verification URL

The QR code is encoded as Base64 and can be scanned by recruiters for instant verification.

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details (development only)"
}
```

## Development

### Run Tests (if implemented)

```bash
npm test
```

### Code Style

- Uses ES6+ module syntax
- Follows Node.js best practices
- Environment variable validation

### Logging

- Console logs for development
- Error logging with context

## Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **File Validation**: MIME type and size checks
4. **Input Validation**: Email, date, and file format validation
5. **CORS Protection**: Configurable origin whitelist
6. **Database Indexing**: Optimized queries for performance

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure MongoDB Atlas or managed database
4. Use environment-specific .env file
5. Enable HTTPS
6. Set up proper logging and monitoring
7. Configure file storage (S3 for production)
8. Implement rate limiting
9. Use reverse proxy (Nginx)

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in .env
- Verify port 27017 is accessible

### File Upload Errors

- Check file size (max 5MB)
- Verify file format (PDF, JPG, PNG)
- Ensure uploads directory has write permissions

### JWT Authentication Failed

- Verify token is properly formatted
- Check JWT_SECRET matches across requests
- Ensure token hasn't expired

## Frontend Integration

The frontend expects the API at `http://localhost:5000/api`

Configure VITE_API_URL in frontend .env:

```
VITE_API_URL=http://localhost:5000/api
```

## License

MIT

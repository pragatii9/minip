# Backend Architecture & Flow

## System Overview

The Certificate Authenticity Verification System consists of a React frontend and a Node.js/Express backend with MongoDB database. This document explains how all components work together.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐   │
│  │ Admin Login  │ Certificate  │ Certificate  │  Dashboard  │   │
│  │              │   Upload     │   Verify     │             │   │
│  └──────────────┴──────────────┴──────────────┴─────────────┘   │
│           ⬇    Axios HTTP + JWT Token    ⬇                      │
├─────────────────────────────────────────────────────────────────┤
│                 BACKEND API (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Routes                                                   │    │
│  │ /api/admin/login, /api/admin/register                   │    │
│  │ /api/certificate/upload, /api/certificate/verify        │    │
│  │ /api/certificate/records, /api/certificate/stats        │    │
│  └─────────────────────────────────────────────────────────┘    │
│           ⬇ Middleware                          ⬇               │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ Auth Middleware      │  │ Upload Middleware    │             │
│  │ (JWT Verification)   │  │ (File Validation)    │             │
│  └──────────────────────┘  └──────────────────────┘             │
│           ⬇ Controllers                         ⬇               │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ Auth Controller      │  │ Certificate          │             │
│  │ (login, register)    │  │ Controller           │             │
│  └──────────────────────┘  └──────────────────────┘             │
│           ⬇ Utils                               ⬇               │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ Hash Utils (SHA-256) │  │ QR Code Utils        │             │
│  │ File Utils           │  │ Validators           │             │
│  └──────────────────────┘  └──────────────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│              DATABASE & FILE STORAGE                             │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ MongoDB              │  │ Local Filesystem     │             │
│  │ (Admin, Certificate) │  │ (Certificate Files)  │             │
│  └──────────────────────┘  └──────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Certificate Upload Flow

### Step-by-Step Process

```
1. Admin logs in with credentials
   ⬇
2. Frontend sends POST /api/admin/login
   ⬇
3. Backend verifies password using bcryptjs
   ⬇
4. Backend generates JWT token
   ⬇
5. Frontend stores token in localStorage
   ⬇
6. Admin uploads certificate file + details
   ⬇
7. Frontend sends multipart/form-data to POST /api/certificate/upload
   ⬇
8. Backend middleware validates:
   - File type (PDF, JPG, PNG)
   - File size (< 5MB)
   - All required fields present
   ⬇
9. Backend saves file to local storage (./uploads)
   ⬇
10. Backend calculates SHA-256 hash of file content
    ⬇
11. Backend generates unique Certificate ID (CERT-xxxxx)
    ⬇
12. Backend generates QR code containing:
    - Certificate ID
    - File hash
    - Issuer email
    - Timestamp
    ⬇
13. Backend creates Certificate document in MongoDB:
    - adminId: 507f...
    - recipientName: "Jane Smith"
    - fileHash: "a3f5c8..."
    - qrCode: "data:image/png;base64,..."
    - status: "active"
    ⬇
14. Backend returns response with:
    - certificateId
    - fileHash
    - qrCode (base64 encoded)
    ⬇
15. Frontend displays QR code to admin
    ⬇
16. Admin can print/share QR code with certificate recipient
```

---

## Certificate Verification Flow

### Method 1: Verify by File Upload

```
1. Recruiter visits verification page
   ⬇
2. Recruiter uploads certificate file
   ⬇
3. Frontend sends POST /api/certificate/verify with file
   ⬇
4. Backend reads uploaded file
   ⬇
5. Backend calculates SHA-256 hash of uploaded file
   ⬇
6. Backend searches MongoDB for matching fileHash
   ⬇
7. If found:
   - Check status (active/expired/revoked)
   - Check expiry date
   - Compare hashes (should match 100%)
   ⬇
8. Backend returns result:
   - VALID: Authentic, not expired
   - TAMPERED: Hash doesn't match
   - EXPIRED_OR_REVOKED: Found but inactive
   - NOT_FOUND: No match in database
   ⬇
9. Frontend displays verification result with details:
   - ✅ VALID with certificate details
   - ❌ TAMPERED with alert
   - ⚠️ EXPIRED/REVOKED with status
```

### Method 2: Verify by Certificate ID (via QR Code)

```
1. Recruiter scans QR code
   ⬇
2. QR code contains JSON:
   {
     "certificateId": "CERT-abc123-xyz789",
     "hash": "a3f5c8d9e2f1b4a7...",
     "issuer": "admin@college.com",
     "verifyUrl": "http://localhost:5173/verify"
   }
   ⬇
3. Browser navigates to verify page with certificateId
   ⬇
4. Frontend sends POST /api/certificate/verify with certificateId
   ⬇
5. Backend searches MongoDB for matching certificateId
   ⬇
6. If found, returns certificate details
   ⬇
7. Frontend displays: ✅ VALID (if not expired/revoked)
```

---

## Database Schema

### Admin Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (bcrypted),
  institute: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- email (unique)
- createdAt (for sorting)

### Certificate Collection

```javascript
{
  _id: ObjectId,
  certificateId: String (unique, indexed) → "CERT-timestamp-random"
  adminId: ObjectId (ref Admin, indexed),

  // Recipient Info
  recipientName: String,
  recipientEmail: String,

  // Certificate Details
  certificateType: String (enum: Bachelor | Master | Diploma | Internship | Course | Other),
  course: String,
  issueDate: Date,
  expiryDate: Date (optional),

  // File Information
  fileName: String,
  filePath: String,
  fileHash: String (SHA-256, indexed) → "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8..."
  fileSize: Number,

  // QR Code
  qrCode: String (Base64 encoded PNG),

  // Verification Tracking
  verifications: {
    count: Number,
    lastVerified: Date,
    details: [
      {
        timestamp: Date,
        result: String (valid | tampered)
      }
    ]
  },

  // Status
  status: String (enum: active | expired | revoked),

  // Metadata
  metadata: {
    issuerName: String,
    signatureUrl: String,
    additionalInfo: Mixed
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- certificateId (unique)
- fileHash (unique)
- adminId + createdAt (for retrieving admin's certificates)
- adminId (for filtering)

---

## Security Features

### 1. Password Security

```javascript
// On registration/password update:
const salt = bcrypt.genSalt(10); // 10 rounds
const hashedPassword = bcrypt.hash(password, salt);
// Store hashedPassword in database

// On login:
const isMatch = bcrypt.compare(inputPassword, storedHashedPassword);
// Only database admin can see hashed passwords
```

### 2. JWT Authentication

```javascript
// On successful login:
const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

// On protected route:
// Extract token from Authorization header
// Verify token signature using JWT_SECRET
// Extract admin ID from token
// Fetch admin details from database
```

### 3. File Validation

```javascript
// Mime type validation
const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];

// Size validation
const maxSize = 5242880; // 5MB

// Extension validation
const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
```

### 4. Input Validation

```javascript
// Email format
/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/[
  // Certificate type enum
  ("Bachelor", "Master", "Diploma", "Internship", "Course", "Other")
];

// Date format (ISO 8601)
new Date(dateString) instanceof Date && !isNaN(dateString);
```

### 5. CORS Protection

```env
CORS_ORIGIN=http://localhost:5173
# Only requests from this origin are allowed
```

---

## Hash Verification Logic

### SHA-256 Hashing

```
File Content → SHA-256 → 64-character hex string
"Sample PDF" → "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b"
```

### Upload Process

```javascript
1. User uploads certificate.pdf
2. Read file as buffer
3. Create SHA-256 hash: hash1 = "a3f5c8..."
4. Store in database: certificate.fileHash = hash1
```

### Verification Process

```javascript
1. User uploads certificate.pdf (same file)
2. Read file as buffer
3. Create SHA-256 hash: hash2 = "a3f5c8..."
4. Compare hashes: hash1 === hash2 → VALID ✅

1. User uploads modified_certificate.pdf (tampered)
2. Read file as buffer
3. Create SHA-256 hash: hash2 = "d7g6h9..."
4. Compare hashes: hash1 !== hash2 → TAMPERED ❌
```

---

## API Response Flow

### Successful Upload Response

```json
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "certificateId": "CERT-abc123-xyz789",
    "recipientName": "Jane Smith",
    "course": "Computer Science",
    "fileHash": "a3f5c8d9...",
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### Successful Verification Response

```json
{
  "success": true,
  "result": "VALID",
  "data": {
    "certificateId": "CERT-abc123-xyz789",
    "recipientName": "Jane Smith",
    "course": "Computer Science",
    "certificateType": "Bachelor",
    "issueDate": "2024-01-15T00:00:00Z",
    "expiryDate": "2026-01-15T00:00:00Z",
    "issuer": "XYZ Institute",
    "issuerEmail": "admin@college.com",
    "status": "valid",
    "hashValid": true,
    "verifications": 5,
    "issuedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

## Error Handling

### Middleware Chain

```
Request
   ⬇
CORS Validation
   ⬇
Body Parser
   ⬇
Router
   ⬇
Route Handler
   ⬇
Auth Middleware (if protected route)
   ⬇
Upload Middleware (if file upload)
   ⬇
Controller Function
   ⬇
Response or Error
   ⬇
Error Handler Middleware
   ⬇
JSON Response
```

### Error Handler

```javascript
// Catches all errors from route handlers
// Formats in consistent JSON structure
// Returns appropriate HTTP status codes
// 400: Bad Request (validation error)
// 401: Unauthorized (auth error)
// 404: Not Found (resource not found)
// 500: Server Error
```

---

## Performance Optimizations

### Database Indexes

```javascript
// Fast queries
db.certificates.createIndex({ certificateId: 1 }); // Lookup by ID
db.certificates.createIndex({ fileHash: 1 }); // Verification
db.certificates.createIndex({ adminId: 1, createdAt: -1 }); // Admin's certs
```

### File Storage

```javascript
// Local filesystem for development
// Scalable to S3/Azure Blob for production
// File structure: ./uploads/timestamp_originalname.ext
```

### Memory Management

```javascript
// Use streams for large file operations
// Memory only for multipart form-data (handled by multer)
// Stored in ./uploads after processing
```

---

## Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (managed database)
- [ ] Enable HTTPS
- [ ] Configure proper CORS_ORIGIN
- [ ] Set up file storage (AWS S3)
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure automated backups
- [ ] Use environment variable vault
- [ ] Enable database authentication
- [ ] Set up CI/CD pipeline

---

## Troubleshooting Common Issues

### Issue: Hash Mismatch on Verification

**Cause:** File was downloaded and re-uploaded or in different format
**Solution:** Ensure exact same binary file is verified

### Issue: QR Code Not Displaying

**Cause:** Base64 data might be too large or corrupted
**Solution:** Check MongoDB size limits and file size

### Issue: Slow Verification on Large Database

**Cause:** Missing database indexes
**Solution:** Ensure indexes are created on fileHash and certificateId

### Issue: Token Expired During Session

**Cause:** JWT expires after configured time (default 7 days)
**Solution:** Implement refresh token mechanism

---

## Next Steps

1. **Development:** Follow SETUP.md to get everything running
2. **Testing:** Use TESTING.md to validate all endpoints
3. **Integration:** Connect frontend to backend via API calls
4. **Deployment:** Follow deployment checklist for production

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

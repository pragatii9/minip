# Complete System Integration Guide

## Frontend-Backend Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WEB BROWSER                                    │
│           http://localhost:5173 (React Frontend)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Landing Page                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │ Upload Page  │  │ Verify Page  │  │ Admin Login  │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│           ⬇ axios.post()  ⬇ axios.get()  ⬇ multipart form             │
├─────────────────────────────────────────────────────────────────────────┤
│                    BACKEND API SERVER                                    │
│           http://localhost:5000/api (Node.js + Express)                │
├─────────────────────────────────────────────────────────────────────────┤
│   POST /admin/login        - Login with email & password                │
│   POST /admin/register     - Register new admin                         │
│   GET  /admin/me           - Get admin profile (with JWT)               │
│   POST /admin/logout       - Logout                                     │
│   ─────────────────────────────────────────────────────────────────     │
│   POST /certificate/upload - Upload cert file + details (with JWT)      │
│   POST /certificate/verify - Verify by file or certificate ID (public)  │
│   GET  /certificate/records - Get all certs (paginated, searchable)     │
│   GET  /certificate/stats   - Dashboard statistics                      │
│   DELETE /certificate/:id  - Revoke certificate                          │
├─────────────────────────────────────────────────────────────────────────┤
│                      mongoose  ⬇  ⬇  fs module                         │
├─────────────────────────────────────────────────────────────────────────┤
│                   DATA LAYER                                             │
│   ┌──────────────────────────┐    ┌──────────────────────────┐         │
│   │ MongoDB (Local/Atlas)    │    │ Local FileSystem         │         │
│   │  ┌────────────────────┐  │    │  ┌──────────────────┐    │         │
│   │  │ Admin Collection   │  │    │  │ ./uploads/       │    │         │
│   │  │ - 2 documents      │  │    │  │ - cert files     │    │         │
│   │  └────────────────────┘  │    │  │ - 1234567_name   │    │         │
│   │  ┌────────────────────┐  │    │  └──────────────────┘    │         │
│   │  │Certificate Collection    │    │                       │         │
│   │  │ - Many documents   │  │    │                       │         │
│   │  │ - With hashes      │  │    │                       │         │
│   │  │ - With QR codes    │  │    │                       │         │
│   │  │ - Indexed for fast │  │    │                       │         │
│   │  │   lookups          │  │    │                       │         │
│   │  └────────────────────┘  │    │                       │         │
│   └──────────────────────────┘    └──────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## User Journeys

### Journey 1: Admin Uploads Certificate

```
1. Admin visits http://localhost:5173/admin/login
   ⬇
2. Enters email & password
   ⬇
3. Frontend sends: POST /api/admin/login
   { email: "admin@college.com", password: "..." }
   ⬇
4. Backend: Hash password → Compare with bcrypt → Generate JWT token
   ⬇
5. Frontend receives token → Stores in localStorage
   ⬇
6. Admin navigates to upload page
   ⬇
7. Selects certificate file + enters details
   - Recipient Name: "Jane Smith"
   - Recipient Email: "jane@example.com"
   - Certificate Type: "Bachelor"
   - Course: "Computer Science"
   - Issue Date: "2024-01-15"
   ⬇
8. Frontend sends: POST /api/certificate/upload
   Content-Type: multipart/form-data
   Authorization: Bearer <JWT_TOKEN>
   ⬇
9. Backend middleware:
   - Verifies JWT token
   - Validates file (type, size)
   - Validates form data
   ⬇
10. Backend processes:
    - Saves file to ./uploads/timestamp_filename.ext
    - Reads file → Calculates SHA-256 hash
    - Generates unique Certificate ID (CERT-abc123-xyz789)
    - Generates QR code (Base64 encoded)
    - Creates Certificate document in MongoDB
    ⬇
11. Frontend receives response:
    {
      certificateId: "CERT-abc123-xyz789",
      fileHash: "a3f5c8d9...",
      qrCode: "data:image/png;base64,..."
    }
    ⬇
12. Frontend displays:
    - ✅ Certificate uploaded successfully
    - QR code image
    - Option to download/print QR code
    ⬇
13. Admin shares QR code with certificate recipient
```

### Journey 2: Recruiter Verifies Certificate

```
Option A: Via QR Code Scan
────────────────────────────
1. Recruiter scans QR code
   ⬇
2. QR code data from admin contains:
   - certificateId: "CERT-abc123-xyz789"
   - fileHash: "a3f5c8d9..."
   - issuer: "admin@college.com"
   - verifyUrl: "http://localhost:5173/verify"
   ⬇
3. Browser redirects to: http://localhost:5173/verify?id=CERT-abc123-xyz789
   ⬇
4. Frontend sends: POST /api/certificate/verify
   { certificateId: "CERT-abc123-xyz789" }
   (NO authentication needed - public endpoint)
   ⬇
5. Backend:
   - Finds certificate by ID in MongoDB
   - Checks status (active/expired/revoked)
   - Returns certificate details
   ⬇
6. Frontend displays:
   ✅ VALID
   - Recipient Name
   - Course
   - Issue Date
   - Issuer
   - All details

Option B: Via File Upload
─────────────────────────
1. Recruiter visits http://localhost:5173/verify
   ⬇
2. Uploads certificate file (PDF/JPG/PNG)
   ⬇
3. Frontend sends: POST /api/certificate/verify
   Content-Type: multipart/form-data
   (NO authentication needed)
   ⬇
4. Backend:
   - Saves file temporarily
   - Calculates SHA-256 hash
   - Searches MongoDB for matching fileHash
   - If found: Check status & details
   - If not found: Return NOT_FOUND
   ⬇
5. Results:
   - VALID: Hash matches + not expired + not revoked
   - TAMPERED: Hash doesn't match
   - EXPIRED_OR_REVOKED: Hash matches but inactive
   - NOT_FOUND: No certificate in system
   ⬇
6. Frontend displays:
   ✅ VALID (with certificate details)
   ❌ TAMPERED (with alert)
   ⚠️ EXPIRED/REVOKED (with status)
   Not found (with message)
```

### Journey 3: Admin Views Dashboard

```
1. Admin navigates to dashboard
   ⬇
2. Frontend sends: GET /api/certificate/stats
   Authorization: Bearer <JWT_TOKEN>
   ⬇
3. Backend:
   - Counts total certificates
   - Counts active certificates
   - Counts expired certificates
   - Counts revoked certificates
   - Sums total verifications
   ⬇
4. Frontend receives:
   {
     total: 150,
     active: 145,
     expired: 4,
     revoked: 1,
     totalVerifications: 487
   }
   ⬇
5. Frontend displays:
   - Total: 150
   - Active: 145
   - Expired: 4
   - Revoked: 1
   - Total Verifications: 487
   ⬇
6. Admin also views certificate records:
   Frontend sends: GET /api/certificate/records?page=1&limit=10
   Authorization: Bearer <JWT_TOKEN>
   ⬇
7. Backend:
   - Retrieves 10 certificates
   - Returns pagination info
   - Returns total count
   ⬇
8. Frontend displays:
   - List of certificates
   - Pagination controls
   - Search & filter options
```

---

## Data Flow: Certificate Verification

### On Upload (Admin)

```
Input File:
  "certificate.pdf" (245KB)
  ⬇ Read as Buffer
Binary Data:
  %PDF-1.4...%% (binary stream)
  ⬇ SHA-256 Hash Function
Hash Output:
  "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b"
  (64 character hex string)
  ⬇ Store in Database
MongoDB Certificate Document:
  {
    certificateId: "CERT-1705750200-abc123",
    fileHash: "a3f5c8d9...",
    filePath: "./uploads/1705750200_certificate.pdf",
    qrCode: "data:image/png;base64,iVBORw0KGgoA...",
    status: "active",
    ...
  }
```

### On Verification (Recruiter)

```
Scenario 1: Same File (VALID)
────────────────────────────
Input File:
  "certificate.pdf" (245KB) - EXACT SAME FILE
  ⬇ Read as Buffer
  (Same binary as before)
  ⬇ SHA-256 Hash
Output Hash:
  "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b7c9d8e1f3a5b"
  ⬇ Compare with Stored Hash
Comparison:
  Uploaded: "a3f5c8..."
  Stored:   "a3f5c8..."
  Result: MATCH ✅
  ⬇
Status Check:
  expiryDate > now? YES
  revoked? NO
  ⬇
Result:
  ✅ VALID (Certificate is authentic and active)

Scenario 2: Tampered File (TAMPERED)
───────────────────────────────────
Input File:
  "certificate_modified.pdf" (246KB) - CHANGED FILE
  (1 byte changed)
  ⬇ SHA-256 Hash
Output Hash:
  "d7g6h9m2p3q4r5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8"
  (COMPLETELY DIFFERENT)
  ⬇ Compare with Stored Hash
Comparison:
  Uploaded: "d7g6h9..."
  Stored:   "a3f5c8..."
  Result: NO MATCH ❌
  ⬇
Result:
  ❌ TAMPERED (Certificate has been modified)

Scenario 3: Wrong File (TAMPERED)
─────────────────────────────────
Input File:
  "other_document.pdf" (500KB)
  ⬇ SHA-256 Hash
Output Hash:
  "e8h7i0n3q4r5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9"
  ⬇ Search Database
Database Search:
  No certificate with this hash
  ⬇
Result:
  NOT_FOUND (File not in system)
  OR
  TAMPERED (If we're checking a specific cert ID)

Scenario 4: Expired Certificate (EXPIRED_OR_REVOKED)
──────────────────────────────────────────────────
Input File:
  "certificate.pdf" - SAME FILE
  ⬇ SHA-256 Hash
Output Hash:
  "a3f5c8..." - MATCHES ✅
  ⬇ But Check Status
Status Check:
  expiryDate: "2023-12-31"
  Today: "2024-01-20"
  Expired? YES
  ⬇
Result:
  ⚠️ EXPIRED_OR_REVOKED (Hash valid but cert inactive)
```

---

## Security Flow

### Password Security

```
User enters password: "MySecurePass123"
  ⬇
bcryptjs.genSalt(10)
  - Generate random salt
  ⬇
bcryptjs.hash(password, salt)
  - Hash password with salt
  ⬇
Store in DB:
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMg66"
  (irreversible)
  ⬇
On Login:
User enters password: "MySecurePass123"
  ⬇
bcryptjs.compare(input, storedHash)
  - Returns true/false
  ⬇
If true: Generate JWT token
If false: Reject login
```

### JWT Authentication

```
After successful login:
  ⬇
Create JWT payload:
  { id: "507f1f77bcf86cd799439011" }
  ⬇
Sign with secret:
  JWT_SECRET = "your_secret_key"
  ⬇
Return token:
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9.h9x..."
  (Header.Payload.Signature format)
  ⬇
Frontend stores token:
  localStorage.setItem('adminToken', token)
  ⬇
On protected requests:
  Include header: Authorization: Bearer <token>
  ⬇
Backend verifies:
  1. Extract token from header
  2. Verify signature using JWT_SECRET
  3. Check expiration (7 days)
  4. Extract admin ID from payload
  5. Load admin from database
  6. Allow or deny request
```

---

## File Storage Structure

```
backend/
└── uploads/
    ├── 1705750200_certificate.pdf      # Admin 1, Cert 1
    ├── 1705750215_degree.pdf           # Admin 1, Cert 2
    ├── 1705750230_internship.png       # Admin 2, Cert 1
    ├── 1705750245_diploma.jpg          # Admin 3, Cert 1
    └── 1705750260_course_cert.pdf      # Admin 2, Cert 2

Each file is named:
  {Timestamp}_{Original_Name_Sanitized}

This ensures:
- Unique filenames
- No filename conflicts
- Manual organization by time
- Easy to identify
```

---

## Database Indexes for Performance

```
Admin Collection:
  - email (unique) → Fast lookup by email
  - createdAt → Sort by creation date

Certificate Collection:
  - certificateId (unique) → Fast lookup by ID
  - fileHash (unique) → Fast verification
  - adminId + createdAt → Get admin's certs in order
  - adminId → Filter certs by admin
  - status → Filter by status

Why indexes matter:
  - 10 docs: No index needed
  - 10,000 docs: Index makes ~100x faster
  - 1,000,000 docs: Index critical for performance
```

---

## Environment Variables Explained

```
MONGODB_URI=mongodb://localhost:27017/certificate-verification
  ⬇ MongoDB connection string
  - localhost:27017 = database server
  - certificate-verification = database name

PORT=5000
  ⬇ Server port
  - Change if 5000 is taken

JWT_SECRET=your_jwt_secret_key_change_in_production
  ⬇ JWT signing key (KEEP SECRET!)
  - Used to sign and verify tokens
  - Change for production
  - Never commit to Git

JWT_EXPIRE=7d
  ⬇ Token expiration time
  - 7 days for development
  - Can adjust as needed

CORS_ORIGIN=http://localhost:5173
  ⬇ Allowed frontend origin
  - Prevents CORS errors
  - Change for production

MAX_FILE_SIZE=5242880
  ⬇ 5MB in bytes
  - Change to desired limit

UPLOAD_DIR=./uploads
  ⬇ Where to store files
  - Created automatically
  - Should be writable directory
```

---

## Response Examples

### Successful Upload

```json
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "certificateId": "CERT-xyvz01-abc789",
    "recipientName": "Jane Smith",
    "course": "Computer Science",
    "fileHash": "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8...",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### Successful Verification (Valid)

```json
{
  "success": true,
  "result": "VALID",
  "data": {
    "certificateId": "CERT-xyvz01-abc789",
    "recipientName": "Jane Smith",
    "course": "Computer Science",
    "status": "valid",
    "hashValid": true,
    "verifications": 5
  }
}
```

### Failed Verification (Tampered)

```json
{
  "success": true,
  "result": "TAMPERED",
  "data": {
    "status": "unknown",
    "hashValid": false
  }
}
```

---

## Ready to Get Started?

1. **Install:** `npm install` in backend folder
2. **Setup:** Follow SETUP.md
3. **Test:** Use TESTING.md
4. **Deploy:** Use deployment section in README.md

# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Admin Authentication Endpoints

### 1. Register Admin

**Endpoint:** `POST /admin/register`
**Authentication:** Public
**Description:** Register a new admin account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "admin@college.com",
  "password": "securePassword123",
  "institute": "XYZ College"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "admin@college.com",
    "institute": "XYZ College"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login Admin

**Endpoint:** `POST /admin/login`
**Authentication:** Public
**Description:** Login with existing admin account

**Request Body:**

```json
{
  "email": "admin@college.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "admin@college.com",
    "institute": "XYZ College"
  }
}
```

---

### 3. Get Current Admin

**Endpoint:** `GET /admin/me`
**Authentication:** Required
**Description:** Get logged-in admin's profile

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "admin@college.com",
    "institute": "XYZ College"
  }
}
```

---

### 4. Logout Admin

**Endpoint:** `POST /admin/logout`
**Authentication:** Required
**Description:** Logout current admin

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Certificate Management Endpoints

### 5. Upload Certificate

**Endpoint:** `POST /certificate/upload`
**Authentication:** Required
**Description:** Upload and register a new certificate

**Request Type:** `multipart/form-data`

**Form Fields:**

- `certificate` (file, required) - PDF, JPG, or PNG file (max 5MB)
- `recipientName` (string, required) - Name of certificate recipient
- `recipientEmail` (string, required) - Email of recipient
- `certificateType` (string, required) - One of: Bachelor, Master, Diploma, Internship, Course, Other
- `course` (string, required) - Course or subject name
- `issueDate` (date, required) - Issue date (YYYY-MM-DD)
- `expiryDate` (date, optional) - Expiry date (YYYY-MM-DD)

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer <token>" \
  -F "certificate=@certificate.pdf" \
  -F "recipientName=Jane Smith" \
  -F "recipientEmail=jane@example.com" \
  -F "certificateType=Bachelor" \
  -F "course=Computer Science" \
  -F "issueDate=2024-01-15" \
  -F "expiryDate=2026-01-15"
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "certificateId": "CERT-abc123-xyz789",
    "recipientName": "Jane Smith",
    "course": "Computer Science",
    "fileHash": "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### 6. Verify Certificate

**Endpoint:** `POST /certificate/verify`
**Authentication:** Public
**Description:** Verify a certificate by file upload or certificate ID

**Method 1: Verify by File Upload**
**Request Type:** `multipart/form-data`

**Form Fields:**

- `certificate` (file, required) - The certificate file to verify

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -F "certificate=@certificate.pdf"
```

**Method 2: Verify by Certificate ID**
**Request Type:** `application/json`

**Request Body:**

```json
{
  "certificateId": "CERT-abc123-xyz789"
}
```

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-abc123-xyz789"}'
```

**Success Response (200):**

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
    "issuer": "XYZ College",
    "issuerEmail": "admin@college.com",
    "status": "valid",
    "hashValid": true,
    "verifications": 5,
    "issuedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Verification Results:**

- `VALID` - Certificate is authentic and valid
- `TAMPERED` - Certificate file has been modified
- `EXPIRED_OR_REVOKED` - Certificate is no longer active
- `NOT_FOUND` - Certificate not found in system

---

### 7. Get Certificate Records

**Endpoint:** `GET /certificate/records`
**Authentication:** Required
**Description:** Get all certificates uploaded by current admin

**Query Parameters:**

- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10) - Records per page
- `search` (string, optional) - Search by certificate ID, recipient name, or course
- `status` (string, optional) - Filter by status: active, expired, revoked

**Example:**

```bash
curl -X GET "http://localhost:5000/api/certificate/records?page=1&limit=10&search=jane&status=active" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "certificateId": "CERT-abc123-xyz789",
      "recipientName": "Jane Smith",
      "recipientEmail": "jane@example.com",
      "certificateType": "Bachelor",
      "course": "Computer Science",
      "issueDate": "2024-01-15T00:00:00Z",
      "expiryDate": "2026-01-15T00:00:00Z",
      "fileSize": 245678,
      "fileHash": "a3f5c8d9e2f1b4a7c9d8e1f3a5b7c9d8...",
      "verifications": {
        "count": 3,
        "lastVerified": "2024-01-22T15:45:00Z"
      },
      "status": "active",
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-22T15:45:00Z"
    }
  ]
}
```

---

### 8. Get Dashboard Statistics

**Endpoint:** `GET /certificate/stats`
**Authentication:** Required
**Description:** Get certificate statistics for admin dashboard

**Example:**

```bash
curl -X GET http://localhost:5000/api/certificate/stats \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 145,
    "expired": 4,
    "revoked": 1,
    "totalVerifications": 487
  }
}
```

---

### 9. Revoke Certificate

**Endpoint:** `DELETE /certificate/:id`
**Authentication:** Required
**Description:** Revoke a certificate (mark as revoked)

**URL Parameters:**

- `id` (string, required) - Certificate MongoDB ID

**Example:**

```bash
curl -X DELETE http://localhost:5000/api/certificate/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Certificate revoked successfully"
}
```

---

## Error Responses

### Common Error Codes

**400 - Bad Request**

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**401 - Unauthorized**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 - Not Found**

```json
{
  "success": false,
  "message": "Certificate not found"
}
```

**500 - Server Error**

```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Data Types

### Certificate Types

- `Bachelor`
- `Master`
- `Diploma`
- `Internship`
- `Course`
- `Other`

### Certificate Status

- `active` - Certificate is valid
- `expired` - Certificate expiry date has passed
- `revoked` - Certificate has been revoked

### Verification Results

- `VALID` - Certificate is authentic
- `TAMPERED` - File hash doesn't match
- `EXPIRED_OR_REVOKED` - Certificate no longer active
- `NOT_FOUND` - Certificate doesn't exist

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing for production.

## File Upload Limits

- **Max File Size:** 5MB
- **Allowed Formats:** PDF, JPG, PNG
- **Storage:** Local filesystem (./uploads)

---

## Sample Integration

### Using JavaScript (Axios)

```javascript
const token = localStorage.getItem("adminToken");
const formData = new FormData();
formData.append("certificate", fileInput.files[0]);
formData.append("recipientName", "Jane Smith");
formData.append("recipientEmail", "jane@example.com");
formData.append("certificateType", "Bachelor");
formData.append("course", "Computer Science");
formData.append("issueDate", "2024-01-15");

axios.post("http://localhost:5000/api/certificate/upload", formData, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Verifying Certificate

```javascript
const response = await axios.post(
  "http://localhost:5000/api/certificate/verify",
  {
    certificateId: "CERT-abc123-xyz789",
  },
);

if (response.data.result === "VALID") {
  console.log("Certificate is authentic!");
}
```

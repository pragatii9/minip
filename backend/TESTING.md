# Testing Guide

This guide provides step-by-step instructions to test all backend API endpoints.

## Prerequisites

- Backend running at `http://localhost:5000`
- MongoDB running and connected
- `curl` installed or use Postman/Insomnia

## Testing Workflow

### Phase 1: Authentication

#### 1.1 Register Admin Account

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@college.com",
    "password": "SecurePass123!",
    "institute": "XYZ Institute"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Admin",
    "email": "admin@college.com",
    "institute": "XYZ Institute"
  }
}
```

**Save the `token` for authenticated requests**

#### 1.2 Login with Credentials

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:** Same as register (new token)

#### 1.3 Get Current Admin Profile

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Admin",
    "email": "admin@college.com",
    "institute": "XYZ Institute"
  }
}
```

#### 1.4 Logout

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X POST http://localhost:5000/api/admin/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Phase 2: Certificate Upload

#### 2.1 Prepare Test Certificate File

Create a sample PDF or use an existing one. For testing, you can create a simple text file and rename it:

```bash
echo "Sample Certificate Content" > certificate.txt
```

#### 2.2 Upload Certificate

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@certificate.txt" \
  -F "recipientName=Jane Smith" \
  -F "recipientEmail=jane@example.com" \
  -F "certificateType=Bachelor" \
  -F "course=Computer Science" \
  -F "issueDate=2024-01-15" \
  -F "expiryDate=2026-01-15"
```

**Expected Response:**

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

**Save `certificateId` and `fileHash` for verification tests**

#### 2.3 Upload Multiple Certificates

Repeat 2.2 with different data:

**Certificate 2:**

```bash
curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@certificate.txt" \
  -F "recipientName=John Doe" \
  -F "recipientEmail=john@example.com" \
  -F "certificateType=Master" \
  -F "course=Data Science" \
  -F "issueDate=2023-06-20"
```

**Certificate 3:**

```bash
curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@certificate.txt" \
  -F "recipientName=Alice Johnson" \
  -F "recipientEmail=alice@example.com" \
  -F "certificateType=Internship" \
  -F "course=Web Development" \
  -F "issueDate=2024-01-01" \
  -F "expiryDate=2024-12-31"
```

---

### Phase 3: Certificate Verification

#### 3.1 Verify by Certificate ID (Valid)

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-abc123-xyz789"}'
```

**Expected Response:**

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
    "verifications": 1,
    "issuedAt": "2024-01-20T10:30:00Z"
  }
}
```

#### 3.2 Verify by File Upload

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -F "certificate=@certificate.txt"
```

**Expected Response:** Same as 3.1 (with verification count incremented)

#### 3.3 Verify Non-Existent Certificate

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-nonexistent-123"}'
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Certificate not found",
  "result": "NOT_FOUND"
}
```

#### 3.4 Verify Tampered Certificate

Modify the certificate file:

```bash
echo "Tampered Content" > certificate_modified.txt

curl -X POST http://localhost:5000/api/certificate/verify \
  -F "certificate=@certificate_modified.txt"
```

**Expected Response:**

```json
{
  "success": true,
  "result": "TAMPERED",
  "data": {
    "certificateId": null,
    ...
  }
}
```

#### 3.5 Verify Expired Certificate

Use a certificate with past expiry date:

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-with-expired-date"}'
```

**Expected Response:**

```json
{
  "success": true,
  "result": "EXPIRED_OR_REVOKED",
  "data": {
    ...
    "status": "expired",
    "hashValid": true
  }
}
```

---

### Phase 4: Records Management

#### 4.1 Get All Records

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/certificate/records \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "total": 3,
    "page": 1,
    "pages": 1
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "certificateId": "CERT-abc123-xyz789",
      "recipientName": "Jane Smith",
      ...
    }
  ]
}
```

#### 4.2 Get Records with Pagination

```bash
curl -X GET "http://localhost:5000/api/certificate/records?page=1&limit=2" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Shows 2 records per page

#### 4.3 Search Records

```bash
curl -X GET "http://localhost:5000/api/certificate/records?search=jane" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Only records matching "jane"

#### 4.4 Filter by Status

```bash
curl -X GET "http://localhost:5000/api/certificate/records?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Only active certificates

#### 4.5 Combined Search and Filter

```bash
curl -X GET "http://localhost:5000/api/certificate/records?search=smith&status=active&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Phase 5: Dashboard Statistics

#### 5.1 Get Statistics

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/certificate/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "active": 2,
    "expired": 1,
    "revoked": 0,
    "totalVerifications": 5
  }
}
```

---

### Phase 6: Certificate Revocation

#### 6.1 Get Certificate ID

From your upload response or records, get the MongoDB `_id`:

```bash
# From records response, copy the _id field
_id="507f1f77bcf86cd799439011"
```

#### 6.2 Revoke Certificate

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X DELETE http://localhost:5000/api/certificate/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Certificate revoked successfully"
}
```

#### 6.3 Verify Revoked Certificate

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-revoked-cert"}'
```

**Expected Response:**

```json
{
  "success": true,
  "result": "EXPIRED_OR_REVOKED",
  "data": {
    "status": "revoked",
    "hashValid": true
  }
}
```

---

## Error Testing

### Test Invalid Token

```bash
curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Test Missing Token

```bash
curl -X GET http://localhost:5000/api/admin/me
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Test Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "Pass123!",
    "institute": "Test"
  }'
```

### Test Duplicate Email

Register twice with same email:

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "duplicate@test.com",
    "password": "Pass123!",
    "institute": "Test"
  }'
```

Second attempt should return duplicate error.

### Test Large File Upload

```bash
# Create a large file (6MB) to exceed 5MB limit
dd if=/dev/zero of=large_file.bin bs=1M count=6

curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@large_file.bin" \
  -F "recipientName=Test" \
  -F "recipientEmail=test@test.com" \
  -F "certificateType=Bachelor" \
  -F "course=Test" \
  -F "issueDate=2024-01-15"
```

**Expected:** File size error

---

## Postman Collection

Create a Postman collection with these requests:

### Environment Variables

```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "your_token_here",
  "adminEmail": "admin@college.com",
  "adminPassword": "SecurePass123!",
  "certificateId": "CERT-abc123-xyz789"
}
```

### Requests

1. Register Admin
2. Login Admin
3. Get Me
4. Logout
5. Upload Certificate
6. Get Records
7. Get Stats
8. Verify Certificate (by ID)
9. Verify Certificate (by File)
10. Revoke Certificate
11. Search Records
12. Filter by Status

---

## Performance Testing

### Test High Verification Load

```bash
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/certificate/verify \
    -H "Content-Type: application/json" \
    -d '{"certificateId": "CERT-abc123-xyz789"}' &
done
wait
```

Monitor response times and error rates.

### Test Concurrent Uploads

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/certificate/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "certificate=@certificate.txt" \
    -F "recipientName=User$i" \
    -F "recipientEmail=user$i@example.com" \
    -F "certificateType=Bachelor" \
    -F "course=Course$i" \
    -F "issueDate=2024-01-15" &
done
wait
```

---

## Checklist

Run through this checklist for complete testing:

- [ ] Admin registration works
- [ ] Admin login works
- [ ] Get admin profile works
- [ ] Logout works
- [ ] Certificate upload successful
- [ ] Certificate hash generated correctly
- [ ] QR code generated
- [ ] Valid certificate verifies successfully
- [ ] Tampered certificate detected
- [ ] Expired certificate shows expired status
- [ ] Non-existent certificate returns not found
- [ ] Get records works
- [ ] Records pagination works
- [ ] Records search works
- [ ] Records filter by status works
- [ ] Get stats works
- [ ] Revoke certificate works
- [ ] Invalid token rejected
- [ ] Missing token rejected
- [ ] Large files rejected
- [ ] Invalid email rejected
- [ ] API health check passes

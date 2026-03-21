# Setup Guide

## Quick Start

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB (Recommended for Development)

**Windows - Using MongoDB Community Edition:**

1. Download from: https://www.mongodb.com/try/download/community
2. Run installer and follow setup wizard
3. MongoDB will run as a service on default port 27017
4. Verify installation:

```bash
mongod --version
```

**Windows - Using MongoDB Atlas (Cloud):**

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

#### Option B: Docker (Recommended for Production)

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

Or use the provided docker-compose.yml:

```bash
docker-compose -f docker-compose.yml up -d
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

**For Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/certificate-verification
MONGO_USER=
MONGO_PASSWORD=

PORT=5000
NODE_ENV=development

JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

ADMIN_EMAIL=admin@institute.com
ADMIN_PASSWORD=defaultPassword123

MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png

CORS_ORIGIN=http://localhost:5173
```

**For MongoDB Atlas:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/certificate-verification?retryWrites=true&w=majority
MONGO_USER=username
MONGO_PASSWORD=password

PORT=5000
NODE_ENV=development

JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
```

### Step 4: Start the Server

**Development Mode (with hot reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server will start on `http://localhost:5000`

### Step 5: Verify Installation

```bash
# Check if server is running
curl http://localhost:5000/health

# Expected response:
# {"status":"OK"}
```

---

## MongoDB Setup Detailed Instructions

### Windows Setup

#### 1. Download MongoDB Community

Visit: https://www.mongodb.com/try/download/community

Select:

- Platform: Windows
- Package: .msi (Installer)
- Version: Latest

#### 2. Run Installer

1. Double-click the `.msi` file
2. Click "Next" through welcome screen
3. Accept License Agreement
4. Choose Setup Type: "Complete"
5. Choose Service Configuration:
   - ✓ Install MongoDB as a Service
   - ✓ Run the MongoDB service as Network Service user
   - Data Directory: C:\Program Files\MongoDB\Server\7.0\data
   - Log Directory: C:\Program Files\MongoDB\Server\7.0\log
6. Click Install

#### 3. Verify Installation

Open PowerShell and run:

```powershell
mongod --version
```

#### 4. Connect to MongoDB

```powershell
mongosh
```

This should open the MongoDB shell. Type `exit` to close.

### Docker Setup (Recommended)

#### Prerequisites

- Docker Desktop installed
- PowerShell or Command Prompt

#### Using docker-compose

Create `docker-compose.yml` in the backend directory:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    container_name: certificate-verification-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: certificate-verification
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

Run MongoDB:

```bash
docker-compose up -d
```

Stop MongoDB:

```bash
docker-compose down
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ..
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure API URL

Edit or create `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Full Stack Development Setup

### Terminal 1: MongoDB (if using Docker)

```bash
cd backend
docker-compose up -d
```

### Terminal 2: Backend API

```bash
cd backend
npm install
npm run dev
```

### Terminal 3: Frontend

```bash
cd .
npm install
npm run dev
```

Now you have:

- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB: localhost:27017

---

## Testing the API

### 1. Register Admin

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@college.com",
    "password": "SecurePass123!",
    "institute": "XYZ College"
  }'
```

Save the returned `token` for next requests.

### 2. Upload Certificate

```bash
curl -X POST http://localhost:5000/api/certificate/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "certificate=@path/to/certificate.pdf" \
  -F "recipientName=Jane Smith" \
  -F "recipientEmail=jane@example.com" \
  -F "certificateType=Bachelor" \
  -F "course=Computer Science" \
  -F "issueDate=2024-01-15"
```

### 3. Verify Certificate

```bash
curl -X POST http://localhost:5000/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "CERT-abc123-xyz789"}'
```

---

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Docker: `docker ps` to verify container is running

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Windows - Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
```

### CORS Error

Ensure `.env` has correct CORS_ORIGIN:

```env
CORS_ORIGIN=http://localhost:5173
```

### File Upload Not Working

- Check `uploads` directory exists
- Verify file size is < 5MB
- Ensure file is PDF, JPG, or PNG
- Check file permissions

---

## Environment Variables Reference

| Variable      | Default                                            | Description                          |
| ------------- | -------------------------------------------------- | ------------------------------------ |
| MONGODB_URI   | mongodb://localhost:27017/certificate-verification | Database connection string           |
| PORT          | 5000                                               | Server port                          |
| NODE_ENV      | development                                        | Environment (development/production) |
| JWT_SECRET    | -                                                  | JWT signing secret (REQUIRED)        |
| JWT_EXPIRE    | 7d                                                 | Token expiration time                |
| CORS_ORIGIN   | http://localhost:5173                              | Frontend origin                      |
| MAX_FILE_SIZE | 5242880                                            | Max file upload size (bytes)         |
| UPLOAD_DIR    | ./uploads                                          | Directory for uploaded files         |

---

## Production Deployment

### Before Deploying

1. **Change JWT_SECRET** to a strong random string
2. **Set NODE_ENV=production**
3. **Use MongoDB Atlas** (or managed database)
4. **Configure proper CORS_ORIGIN**
5. **Enable HTTPS**
6. **Set up file storage** (AWS S3 recommended)
7. **Configure logging** and monitoring

### Deployment Platforms

#### Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

#### Railway

```bash
railway link
railway up
```

#### Azure App Service

```bash
az webapp up --name your-app-name
```

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Deploy

---

## Next Steps

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
2. Check [TESTING.md](./TESTING.md) for testing examples
3. Review [README.md](./README.md) for architecture overview
4. Explore frontend integration examples

---

## Getting Help

For issues:

1. Check error messages carefully
2. Review terminal logs
3. Verify environment variables
4. Check if services are running (`docker ps`, `npm run dev`)
5. Review API_DOCUMENTATION.md

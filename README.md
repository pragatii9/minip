# Certificate Verification System

A modern, responsive React.js frontend for a Certificate Verification System with advanced security features and intuitive user interface.

## Features

### Core Functionality
- **Certificate Upload**: Drag & drop interface for uploading certificates (PDF, JPG, PNG)
- **QR Code Generation**: Automatic QR code generation for each certificate
- **Certificate Verification**: Verify certificates via file upload or QR code scanning
- **Admin Dashboard**: Comprehensive dashboard with statistics and management tools
- **Records Management**: Search, filter, and paginate through certificate records

### Technical Features
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth loading indicators throughout the app
- **Form Validation**: Comprehensive client-side validation
- **Protected Routes**: Admin-only routes with authentication

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **QR Code**: html5-qrcode library
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Layout.jsx
│   ├── Header.jsx
│   ├── FileUpload.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── AdminLogin.jsx
│   ├── AdminDashboard.jsx
│   ├── UploadCertificate.jsx
│   ├── VerifyCertificate.jsx
│   └── RecordsPage.jsx
├── services/           # API services
│   └── api.js
├── utils/              # Helper functions
│   ├── constants.js
│   └── helpers.js
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd certificate-verification-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your API endpoint:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend expects the following API endpoints:

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

### Certificates
- `POST /api/certificate/upload` - Upload new certificate
- `POST /api/certificate/verify` - Verify certificate
- `GET /api/certificate/records` - Get certificate records
- `GET /api/certificate/stats` - Get dashboard statistics

### Request/Response Examples

#### Upload Certificate
```javascript
// Request: POST /api/certificate/upload
// Content-Type: multipart/form-data
{
  file: File,
  name: "John Doe",
  type: "Academic",
  date: "2024-01-15",
  certificateId: "ABC123456789"
}

// Response
{
  success: true,
  data: {
    certificateId: "ABC123456789",
    hash: "sha256:...",
    qrCode: "data:image/png;base64,..."
  }
}
```

#### Verify Certificate
```javascript
// Request: POST /api/certificate/verify
{
  file: File
  // OR
  certificateId: "ABC123456789"
}

// Response
{
  success: true,
  data: {
    valid: true,
    message: "Certificate is valid",
    details: {
      certificateId: "ABC123456789",
      name: "John Doe",
      type: "Academic",
      date: "2024-01-15",
      status: "verified"
    }
  }
}
```

## Features in Detail

### Landing Page
- Hero section with call-to-action buttons
- Statistics showcase
- Feature highlights
- Responsive design

### Admin Authentication
- Secure login form with validation
- Password strength requirements
- JWT token management
- Auto-logout on token expiration

### Admin Dashboard
- Real-time statistics cards
- Quick action buttons
- Recent activity feed
- Responsive sidebar navigation

### Certificate Upload
- Drag & drop file upload
- File type and size validation
- Automatic certificate ID generation
- QR code generation and download
- SHA-256 hash display

### Certificate Verification
- File upload verification
- QR code scanning with camera
- Real-time verification results
- Detailed certificate information display

### Records Management
- Searchable and filterable table
- Pagination for large datasets
- Export functionality (CSV)
- Status badges and indicators

## UI/UX Design

### Design Principles
- **Clean & Modern**: Fintech-inspired design with rounded corners and soft shadows
- **Color Scheme**: 
  - Primary: Blue (#3b82f6)
  - Success: Green (#22c55e)
  - Error: Red (#ef4444)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements
- Adaptive layouts for all screen sizes

## Security Considerations

- JWT-based authentication
- Input validation and sanitization
- File upload restrictions
- XSS prevention
- CSRF protection (backend implementation required)
- Secure API communication

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

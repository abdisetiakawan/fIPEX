# 🎨 Digital Exhibition - Pameran Digital Karya Mahasiswa

Digital Exhibition adalah platform pameran digital yang memungkinkan mahasiswa untuk menampilkan karya-karya mereka dan pengunjung untuk memberikan vote serta komentar. Platform ini dilengkapi dengan sistem manajemen admin untuk panitia.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi dan Setup](#instalasi-dan-setup)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Project](#struktur-project)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🚀 Fitur Utama

### 👨‍🎓 Mahasiswa
- ✅ Upload dan manajemen karya
- ✅ Portfolio pribadi
- ✅ Tracking votes dan views
- ✅ Edit profil dan informasi akademik
- ✅ Dashboard analytics

### 👥 Pengunjung
- ✅ Browse katalog karya
- ✅ Vote dan komentar pada karya
- ✅ Sistem favorit
- ✅ Filter dan pencarian
- ✅ Profil pengunjung

### 👨‍💼 Panitia (Admin)
- ✅ Dashboard analytics real-time
- ✅ Review dan approve karya
- ✅ Manajemen user
- ✅ Voting monitor
- ✅ Sistem jadwal dan notifikasi email
- ✅ Export data

### 🔧 Fitur Sistem
- ✅ Authentication dengan JWT + Cookies
- ✅ File upload untuk thumbnail
- ✅ Email notifications dengan Nodemailer
- ✅ Real-time statistics
- ✅ Responsive design
- ✅ Rate limiting dan security

## 🛠 Teknologi yang Digunakan

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool dan dev server
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Firestore** - NoSQL database
- **Firebase Admin SDK** - Server-side Firebase
- **JWT** - Authentication tokens
- **Nodemailer** - Email service
- **Multer** - File upload middleware
- **bcryptjs** - Password hashing

### Tools & Security
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation
- **Morgan** - HTTP request logger

## 📋 Persyaratan Sistem

### Software Requirements
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** (untuk cloning repository)

### Accounts & Services
- **Firebase Project** (untuk database)
- **Gmail Account** (untuk email service)
- **Code Editor** (VS Code recommended)

## 🔧 Instalasi dan Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd digital-exhibition
```

### 2. Setup Backend

```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Setup Frontend

```bash
# Masuk ke folder client
cd ../client-fipex

# Install dependencies
npm install
```

### 4. Firebase Setup

1. **Buat Firebase Project:**
   - Kunjungi [Firebase Console](https://console.firebase.google.com/)
   - Klik "Create a project"
   - Ikuti wizard setup

2. **Enable Firestore:**
   - Di Firebase Console, pilih "Firestore Database"
   - Klik "Create database"
   - Pilih "Start in test mode" (untuk development)

3. **Generate Service Account:**
   - Pergi ke Project Settings > Service Accounts
   - Klik "Generate new private key"
   - Download file JSON
   - Rename menjadi `firebase-secret.json`
   - Letakkan di folder `server/config/`

### 5. Email Service Setup

1. **Enable 2-Factor Authentication** di Gmail
2. **Generate App Password:**
   - Pergi ke Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password untuk "Mail"
   - Simpan password ini

## ⚙️ Konfigurasi

### Server Configuration (`server/.env`)

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Firebase Configuration
# (Firebase config loaded from firebase-secret.json)
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email address | `your-email@gmail.com` |
| `SMTP_PASS` | Email app password | `abcd efgh ijkl mnop` |

## 🚀 Menjalankan Aplikasi

### Development Mode

1. **Start Backend Server:**
```bash
cd server
npm run dev
```
Server akan berjalan di: `http://localhost:3000`

2. **Start Frontend (Terminal baru):**
```bash
cd client-fipex
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

### Production Mode

1. **Build Frontend:**
```bash
cd client-fipex
npm run build
```

2. **Start Production Server:**
```bash
cd server
NODE_ENV=production npm start
```

## 📁 Struktur Project

```
digital-exhibition/
├── server/                     # Backend application
│   ├── config/                 # Configuration files
│   │   ├── firebase.js         # Firebase configuration
│   │   ├── firebase-secret.json # Firebase service account
│   │   └── email.js            # Email configuration
│   ├── middleware/             # Express middlewares
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Error handling
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── validation.js       # Input validation
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── public.js           # Public routes
│   │   ├── works.js            # Works management
│   │   ├── admin.js            # Admin routes
│   │   └── panitia.js          # Panitia routes
│   ├── services/               # Business logic
│   │   ├── authService.js      # Authentication service
│   │   └── emailService.js     # Email service
│   ├── uploads/                # File uploads directory
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── app.js                  # Express application
│   └── package.json            # Dependencies
│
├── client-fipex/               # Frontend application
│   ├── src/
│   │   ├── components/         # Vue components
│   │   │   ├── mahasiswa/      # Student components
│   │   │   ├── pengunjung/     # Visitor components
│   │   │   └── panitia/        # Admin components
│   │   ├── stores/             # Pinia stores
│   │   ├── services/           # API services
│   │   ├── router/             # Vue Router
│   │   └── assets/             # Static assets
│   ├── public/                 # Public assets
│   ├── package.json            # Dependencies
│   └── vite.config.js          # Vite configuration
│
└── README.md                   # Project documentation
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/public/works` | Get approved works | No |
| GET | `/api/public/works/:id` | Get work details | No |
| POST | `/api/public/works/:id/vote` | Vote for work | Yes (Pengunjung) |
| POST | `/api/public/works/:id/comments` | Add comment | Yes (Pengunjung) |
| GET | `/api/public/stats` | Get statistics | No |

### Works Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/works/my-works` | Get user's works | Yes (Mahasiswa) |
| POST | `/api/works` | Create new work | Yes (Mahasiswa) |
| PUT | `/api/works/:id` | Update work | Yes (Owner) |
| DELETE | `/api/works/:id` | Delete work | Yes (Owner) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Admin dashboard | Yes (Panitia) |
| GET | `/api/admin/works` | All works for review | Yes (Panitia) |
| PUT | `/api/admin/works/:id/review` | Review work | Yes (Panitia) |
| GET | `/api/admin/users` | All users | Yes (Panitia) |

## 👥 User Roles

### 🎓 Mahasiswa (Student)
- **Registration:** Requires NIM, Program Studi, Angkatan
- **Capabilities:**
  - Upload karya dengan thumbnail
  - Edit dan delete karya sendiri
  - View portfolio dan statistics
  - Update profil akademik
- **Restrictions:**
  - Tidak bisa vote atau comment
  - Hanya bisa manage karya sendiri

### 👤 Pengunjung (Visitor)
- **Registration:** Requires nama, email, optional institution
- **Capabilities:**
  - Browse dan search karya
  - Vote pada karya (1x per karya)
  - Comment pada karya
  - Favorite karya
  - View profil dan activity
- **Restrictions:**
  - Tidak bisa upload karya
  - Tidak bisa akses admin features

### 👨‍💼 Panitia (Admin)
- **Registration:** Manual atau special registration
- **Capabilities:**
  - Full dashboard access
  - Review dan approve/reject karya
  - Manage users (activate/deactivate)
  - Create dan manage sessions
  - Send email notifications
  - Export data dan analytics
  - Monitor voting activities
- **Restrictions:**
  - Tidak bisa upload karya
  - Tidak bisa vote atau comment

## 🔐 Security Features

### Authentication
- **JWT Tokens** dengan HTTP-only cookies
- **Password Hashing** dengan bcrypt
- **Session Management** dengan automatic logout
- **Role-based Access Control**

### API Security
- **Rate Limiting** untuk prevent abuse
- **Input Validation** dengan express-validator
- **CORS Configuration** untuk cross-origin requests
- **Helmet** untuk security headers
- **File Upload Validation** untuk prevent malicious files

### Data Protection
- **Firestore Security Rules**
- **Environment Variables** untuk sensitive data
- **Error Handling** tanpa expose internal info
- **Logging** untuk monitoring dan debugging

## 🐛 Troubleshooting

### Common Issues

#### 1. Server tidak bisa start
```bash
# Check if port is already in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 2. Firebase connection error
- Pastikan `firebase-secret.json` ada di `server/config/`
- Check Firebase project settings
- Verify Firestore is enabled

#### 3. Email tidak terkirim
- Verify Gmail app password
- Check SMTP settings di `.env`
- Ensure 2FA is enabled di Gmail account

#### 4. File upload error
- Check `uploads/` directory exists
- Verify file permissions
- Check file size limits (5MB default)

#### 5. CORS errors
- Verify `CLIENT_URL` di `.env`
- Check CORS configuration di `app.js`

#### 6. Authentication issues
- Clear browser cookies
- Check JWT_SECRET di `.env`
- Verify token expiration

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

### Database Issues

Reset Firestore data:
```javascript
// In Firebase Console > Firestore
// Delete collections: users, works, votes, comments, favorites
```

## 📝 Development Guidelines

### Code Style
- Use **ES6+** features
- Follow **Vue 3 Composition API**
- Use **async/await** untuk promises
- Implement proper **error handling**
- Add **comments** untuk complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Testing
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client-fipex
npm test
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` untuk production domain
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure production email service
- [ ] Set up monitoring dan logging
- [ ] Configure backup strategy

### Environment Setup
```env
NODE_ENV=production
CLIENT_URL=https://your-domain.com
JWT_SECRET=your-production-secret
# ... other production configs
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

1. Check [Troubleshooting](#troubleshooting) section
2. Search existing issues di repository
3. Create new issue dengan detail lengkap
4. Contact development team

## 🎯 Roadmap

### Upcoming Features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Integration dengan social media
- [ ] Advanced search filters
- [ ] Batch operations untuk admin
- [ ] API documentation dengan Swagger
- [ ] Automated testing suite

---

**Happy Coding! 🚀**

Dibuat dengan ❤️ untuk Digital Exhibition Platform
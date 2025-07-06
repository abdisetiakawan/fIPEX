# 🚀 Installation Guide - Digital Exhibition

Panduan instalasi lengkap untuk menjalankan Digital Exhibition di local development environment.

## 📋 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (included with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Verify Installation
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show v8.0.0 or higher
git --version     # Should show git version
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. **Kunjungi Firebase Console:**
   - Buka [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Login dengan Google account

2. **Create New Project:**
   - Klik "Create a project"
   - Masukkan project name: `digital-exhibition`
   - Disable Google Analytics (optional)
   - Klik "Create project"

### 2. Setup Firestore Database

1. **Enable Firestore:**
   - Di sidebar, klik "Firestore Database"
   - Klik "Create database"
   - Pilih "Start in test mode"
   - Pilih location (asia-southeast1 recommended)
   - Klik "Done"

2. **Configure Security Rules (Optional for Development):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: Only for development!
    }
  }
}
```

### 3. Generate Service Account

1. **Go to Project Settings:**
   - Klik gear icon ⚙️ > "Project settings"
   - Pilih tab "Service accounts"

2. **Generate Private Key:**
   - Klik "Generate new private key"
   - Klik "Generate key"
   - File JSON akan ter-download

3. **Setup Service Account:**
   - Rename file menjadi `firebase-secret.json`
   - **PENTING:** File ini akan ditempatkan di `server/config/` nanti

## 📧 Gmail Setup for Email Service

### 1. Enable 2-Factor Authentication

1. **Go to Google Account:**
   - Buka [https://myaccount.google.com/](https://myaccount.google.com/)
   - Klik "Security" di sidebar

2. **Enable 2-Step Verification:**
   - Scroll ke "2-Step Verification"
   - Klik "Get started"
   - Ikuti wizard setup

### 2. Generate App Password

1. **Access App Passwords:**
   - Di halaman Security, scroll ke "2-Step Verification"
   - Klik "App passwords"

2. **Generate Password:**
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Type: "Digital Exhibition"
   - Klik "Generate"

3. **Save Password:**
   - Copy 16-character password (format: `abcd efgh ijkl mnop`)
   - **PENTING:** Simpan password ini untuk konfigurasi nanti

## 💻 Project Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd digital-exhibition

# Verify structure
ls -la
# Should show: server/ client-fipex/ README.md
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Create uploads directory
mkdir -p uploads

# Verify installation
npm list --depth=0
```

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client-fipex

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

## ⚙️ Configuration

### 1. Backend Configuration

**File: `server/.env`**

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Configuration - CHANGE THIS!
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-for-security
JWT_EXPIRES_IN=7d

# Email Configuration - UPDATE WITH YOUR DETAILS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Firebase Configuration
# (Firebase config is loaded from firebase-secret.json)
```

**⚠️ IMPORTANT NOTES:**
- Replace `your-email@gmail.com` dengan email Anda
- Replace `your-16-character-app-password` dengan app password dari Gmail
- Generate JWT_SECRET yang kuat (minimal 32 karakter)

### 2. Firebase Service Account

```bash
# Copy firebase service account file
cp /path/to/downloaded/firebase-secret.json server/config/firebase-secret.json

# Verify file exists
ls -la server/config/
# Should show: firebase-secret.json firebase.js email.js
```

### 3. Generate Strong JWT Secret

```bash
# Generate random secret (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy output to JWT_SECRET in .env file
```

## 🧪 Test Installation

### 1. Test Backend

```bash
cd server

# Start development server
npm run dev

# Should see output:
# 🚀 Server running on port 3000
# 📱 Client URL: http://localhost:5173
# ✅ Email server is ready to send messages
```

**Test API:**
```bash
# In new terminal
curl http://localhost:3000/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

### 2. Test Frontend

```bash
# In new terminal
cd client-fipex

# Start development server
npm run dev

# Should see output:
# VITE v4.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
# ➜ Network: use --host to expose
```

**Test Frontend:**
- Buka browser: `http://localhost:5173`
- Should see Digital Exhibition homepage

### 3. Test Database Connection

```bash
# Check server logs for:
# ✅ Firebase connected successfully
# Data: { time: '2024-...' }
```

### 4. Test Email Service

```bash
# Check server logs for:
# ✅ Email server is ready to send messages
```

## 🎯 First Run Setup

### 1. Create Admin Account

1. **Open Frontend:** `http://localhost:5173`
2. **Register as Panitia:**
   - Klik "Daftar"
   - Pilih role "Panitia"
   - Fill required information
   - Submit registration

### 2. Create Test Accounts

**Mahasiswa Account:**
- Role: Mahasiswa
- NIM: 12345678
- Program: Teknik Informatika
- Angkatan: 2024

**Pengunjung Account:**
- Role: Pengunjung
- Institution: Universitas Test

### 3. Test Core Features

1. **Login as Mahasiswa:**
   - Upload sample work
   - Check dashboard

2. **Login as Panitia:**
   - Review and approve work
   - Check admin dashboard

3. **Login as Pengunjung:**
   - Browse approved works
   - Vote and comment

## 🔧 Development Tools

### 1. VS Code Extensions (Recommended)

```bash
# Install VS Code extensions
code --install-extension Vue.volar
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-json
```

### 2. Browser Extensions

- **Vue.js devtools** - For debugging Vue components
- **React Developer Tools** - For debugging (if needed)

### 3. Useful Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests (if available)

# Frontend
cd client-fipex
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🐛 Common Installation Issues

### Issue 1: Node.js Version Error
```bash
# Error: Node.js version not supported
# Solution: Update Node.js
nvm install 18        # If using nvm
nvm use 18
```

### Issue 2: Firebase Permission Error
```bash
# Error: Permission denied
# Solution: Check firebase-secret.json path and permissions
ls -la server/config/firebase-secret.json
chmod 600 server/config/firebase-secret.json
```

### Issue 3: Email Authentication Error
```bash
# Error: Invalid login
# Solution: Verify app password and 2FA
# - Ensure 2FA is enabled
# - Generate new app password
# - Update .env file
```

### Issue 4: Port Already in Use
```bash
# Error: EADDRINUSE :::3000
# Solution: Kill process or use different port
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env file
```

### Issue 5: CORS Error
```bash
# Error: CORS policy
# Solution: Verify CLIENT_URL in server/.env
# Should be: CLIENT_URL=http://localhost:5173
```

## ✅ Installation Checklist

- [ ] Node.js >= 16.0.0 installed
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Service account key downloaded
- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Firebase service account placed
- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] Database connection working
- [ ] Email service configured
- [ ] Admin account created
- [ ] Test accounts created
- [ ] Core features tested

## 🚀 Next Steps

After successful installation:

1. **Read Main Documentation:** `README.md`
2. **Explore API Documentation:** Check API endpoints
3. **Test All Features:** Create works, vote, comment
4. **Customize Configuration:** Adjust settings as needed
5. **Start Development:** Begin adding new features

## 📞 Need Help?

If you encounter issues:

1. **Check Logs:** Look at server and browser console
2. **Verify Configuration:** Double-check all config files
3. **Test Connections:** Ensure Firebase and email work
4. **Search Issues:** Look for similar problems
5. **Ask for Help:** Create detailed issue report

---

**Installation Complete! 🎉**

Your Digital Exhibition platform is now ready for development!
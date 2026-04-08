<div align="center">
  
# 👥 HR Attendance Dashboard

### *Secure Multi-Factor Authentication & Employee Attendance Management System*

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Status](https://img.shields.io/badge/Status-Production-green?style=for-the-badge)]()
[![Security](https://img.shields.io/badge/Security-MFA-blue?style=for-the-badge)]()

</div>

---

## 🎯 Project Overview

> **A production-grade HR dashboard with integrated multi-factor authentication for secure employee attendance tracking.**

This system provides HR teams with real-time attendance monitoring, secure access control, and comprehensive reporting capabilities.

### Key Capabilities:
- ✅ **Secure Authentication** - Multi-factor authentication (MFA) integration
- ✅ **Real-time Tracking** - Live employee check-in/out
- ✅ **HR Analytics** - Attendance patterns and insights
- ✅ **Role-Based Access** - Admin, Manager, Employee views

## 🏗️ System Architecture
┌─────────────────────────────────────────────────────────────┐
│ Client Browser (Vite + React) │
└─────────────────────────┬───────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────────┐
│ Nginx / Railway Proxy │
└─────────────────────────┬───────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────────┐
│ Express.js Backend (server.js) │
│ ┌─────────────────────────────────────┐ │
│ │ • Authentication Middleware (MFA) │ │
│ │ • Attendance Routes │ │
│ │ • Employee Management API │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
▼
┌─────────────────────────────────────────────────────────────┐
│ Database (PostgreSQL / MongoDB) │
└─────────────────────────────────────────────────────────────┘

## 🚀 Quick Start

### Prerequisites
```bash
Node.js (v20+)
npm or yarn
Installation
# Clone the repository
git clone https://github.com/areebajavid/HR_attendance_dashboard.git

# Navigate to project
cd HR_attendance_dashboard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env
# Add your MFA credentials and database URL

# Run development server
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)  
cd frontend && npm run dev
📁 Project Structure
HR_attendance_dashboard/
│
├── backend/                 # Express.js API server
│   ├── server.js           # Main application entry
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── models/             # Database schemas
│   └── middleware/         # Auth & validation
│
├── frontend/               # Vite + React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard views
│   │   └── services/       # API integration
│   └── vite.config.js      # Vite configuration
│
├── nixpacks.toml           # Railway deployment config
├── package.json            # Root workspace config
└── README.md               # Documentation
🔐 Security Features
Feature	Implementation
Multi-Factor Auth	TOTP-based 2FA
Session Management	JWT with refresh tokens
Rate Limiting	express-rate-limit
Input Validation	Joi/Zod schemas
Secure Headers	Helmet.js
📊 API Endpoints
// Authentication
POST   /api/auth/login      // User login with MFA
POST   /api/auth/verify      // Verify OTP
POST   /api/auth/logout      // Invalidate session

// Attendance  
GET    /api/attendance       // Get all records
POST   /api/attendance/checkin
PUT    /api/attendance/checkout/:id

// Employees
GET    /api/employees        // List all employees
GET    /api/employees/:id    // Get employee details
📈 Future Roadmap
Facial recognition check-in

Mobile app (React Native)

Export reports (PDF/Excel)

Slack/Teams integration

Biometric hardware integration

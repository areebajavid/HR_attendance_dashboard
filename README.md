<div align="center">
  
# 👥 HR Attendance Dashboard

### *Employee Leave Management System with JWT Authentication*

[![Node.js](https://img.shields.io/badge/Node.js-Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-Router-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-2-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

</div>

---

## 📌 Project Overview

> **A full-stack employee leave management system with secure JWT authentication, role-based access, and comprehensive reporting.**

This system allows HR teams to track employee leaves, manage balances, generate reports, and monitor daily attendance.

### Core Capabilities:
- 🔐 **JWT Authentication** - Secure login with 8-hour sessions
- 👥 **Employee Management** - View all employees with details
- 📅 **Leave Tracking** - Batch save, view by date, monthly reports
- 📊 **Leave Balances** - Track 10+ leave types per employee
- 📈 **Analytics** - Leave summary and trends

---

## 🏗️ Architecture

┌─────────────────────────────────────────────────────────────────┐
│ React Frontend (Vite) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Login │ │ Employee │ │ Leave │ │
│ │ Page │ │ Table │ │ Balance │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
│ │ │ │ │
│ └───────────────┼───────────────┘ │
│ │ │
│ ProtectedRoute │
│ (JWT Token Check) │
└─────────────────────────┬───────────────────────────────────────┘
│ HTTP /api/*
▼
┌─────────────────────────────────────────────────────────────────┐
│ Express.js Backend │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ authenticateToken (JWT verification middleware) │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌──────────────────────┴──────────────────────────────────┐ │
│ │ API Routes │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ POST /api/login │ Login + JWT generation │ │
│ │ GET /api/employees │ List all employees │ │
│ │ POST /api/leaves/batch │ Batch save leaves │ │
│ │ GET /api/leaves/by-date │ Leaves for specific date│ │
│ │ GET /api/leaves/summary │ Yearly leave summary │ │
│ │ GET /api/leave-balances │ Per-employee balances │ │
│ │ GET /api/leaves/monthly-report │ Monthly report │ │
│ │ GET /api/daily-attendance │ Today's attendance │ │
│ │ DELETE /api/leaves/reset │ Delete all leaves │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ MySQL Database │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ users │ │ employees │ │
│ ├──────────────┤ ├──────────────┤ │
│ │ id (PK) │ │ id (PK) │ │
│ │ username │ │ ee_id │ │
│ │ password │ │ employee_name│ │
│ │ role │ │ department │ │
│ └──────────────┘ │ reporting_manager│ │
│ │ position_title│ │
│ └───────┬──────┘ │
│ │ │
│ ┌───────▼──────┐ │
│ │ leaves │ │
│ ├──────────────┤ │
│ │ id (PK) │ │
│ │ employee_id(FK)│ │
│ │ leave_date │ │
│ │ leave_type │ │
│ └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘



## ✨ Features (What Actually Exists)

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | POST | Username/password login → returns JWT (8hr expiry) |

### Employee Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/employees` | GET | Returns all employees (id, name, ee_id, department, manager, position) |

### Leave Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leaves/batch` | POST | Batch insert/update leaves (employee_id, leave_date, leave_type) |
| `/api/leaves/by-date` | GET | Get all leaves for a specific date |
| `/api/leaves/summary` | GET | Yearly leave type counts (current year) |
| `/api/leave-balances` | GET | Per-employee leave balances for current year |
| `/api/leaves/monthly-report` | GET | Detailed monthly leave report |
| `/api/leaves/reset` | DELETE | Delete all leave records |

### Attendance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily-attendance` | GET | Today's attendance with leave status |

---

## 📁 Project Structure (Actual)
HR_attendance_dashboard/
│
├── backend/ # Backend source (separate folder)
│ └── (backend files)
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── LoginPage.jsx/.tsx
│ │ │ ├── ProtectedRoute.jsx/.tsx
│ │ │ ├── DashboardLayout.jsx/.tsx
│ │ │ ├── EmployeeTablePage.jsx/.tsx
│ │ │ ├── LeaveBalancePage.jsx/.tsx
│ │ │ └── AnalyticsPage.jsx/.tsx
│ │ └── App.jsx/.tsx
│ └── (Vite config files)
│
├── server.js # Express backend entry point
├── package.json # Backend dependencies
├── package-lock.json
├── nixpacks.toml # Railway deployment config
└── README.md

Database Schema
-- Users table for authentication
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user'
);

-- Employees table
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ee_id VARCHAR(50) NOT NULL UNIQUE,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  reporting_manager VARCHAR(255),
  position_title VARCHAR(255)
);

-- Leaves table
CREATE TABLE leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  leave_date DATE NOT NULL,
  leave_type VARCHAR(100) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  UNIQUE KEY unique_employee_date (employee_id, leave_date)
);

🔧 Dependencies (From package.json)
Package	Version	Purpose
express	^4.18.2	Web framework
mysql2	^3.14.4	MySQL database driver
bcrypt	^6.0.0	Password hashing
jsonwebtoken	^9.0.2	JWT generation/verification
cors	^2.8.5	Cross-origin requests
dotenv	^17.2.2	Environment variables
nodemon	^3.1.10	Dev auto-reload


📊 Leave Types Tracked
From your code, these leave types are supported:

Leave Type	Code
Earned Leave	Earned Leave - EL
Sick Leave	Sick Leave - SL
Work From Home	WFH
Compensatory Off	Comp Off
Leave Without Pay	LWP
Half Day	(0.5) in leave_type
Maternity Leave	Maternity
Paternity Leave	Paternity
Mandatory Holiday	Mandatory Holiday
Optional Holiday	Optional Holiday - OH

🔐 Authentication Flow
1. User submits username/password to POST /api/login
2. Server hashes & compares with bcrypt
3. On success, returns JWT token (expires in 8 hours)
4. Frontend stores token (likely in localStorage)
5. All subsequent requests include: Authorization: Bearer <token>
6. authenticateToken middleware verifies JWT_SECRET

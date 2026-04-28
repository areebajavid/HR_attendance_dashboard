# 👥 HR Attendance Dashboard

> A full-stack employee leave management system with JWT authentication, role-based access, and comprehensive reporting.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with 8-hour sessions
- 👥 **Employee Management** — View all employees with department and manager details
- 📅 **Leave Tracking** — Batch save, view by date, and monthly reports
- 📊 **Leave Balances** — Track 10+ leave types per employee
- 📈 **Analytics** — Yearly summaries and leave trends
- 🏢 **Daily Attendance** — Real-time attendance status with leave overlay

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Deployment | Railway |

---

## 📁 Project Structure

```
HR_attendance_dashboard/
├── backend/                  # Backend source
├── frontend/                 # React + Vite frontend
│   └── src/
│       └── components/
│           ├── LoginPage.jsx
│           ├── ProtectedRoute.jsx
│           ├── DashboardLayout.jsx
│           ├── EmployeeTablePage.jsx
│           ├── LeaveBalancePage.jsx
│           └── AnalyticsPage.jsx
├── server.js                 # Express entry point
├── nixpacks.toml             # Railway deployment config
└── package.json
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login → returns JWT (8hr expiry) |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/daily-attendance` | Today's attendance with leave status |

### Leaves
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leaves/batch` | Batch insert/update leaves |
| GET | `/api/leaves/by-date` | Leaves for a specific date |
| GET | `/api/leaves/summary` | Yearly leave type counts |
| GET | `/api/leaves/monthly-report` | Detailed monthly report |
| GET | `/api/leave-balances` | Per-employee balances |
| DELETE | `/api/leaves/reset` | Delete all leave records |

---

## 📋 Leave Types Supported

`Earned Leave` · `Sick Leave` · `Work From Home` · `Comp Off` · `LWP` · `Half Day` · `Maternity` · `Paternity` · `Mandatory Holiday` · `Optional Holiday`

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ee_id VARCHAR(50) NOT NULL UNIQUE,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  reporting_manager VARCHAR(255),
  position_title VARCHAR(255)
);

CREATE TABLE leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  leave_date DATE NOT NULL,
  leave_type VARCHAR(100) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  UNIQUE KEY unique_employee_date (employee_id, leave_date)
);
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- MySQL database

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Fill in your `.env`:
```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

```bash
# Start backend
node server.js

# Start frontend
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication Flow

1. User submits credentials to `POST /api/login`
2. Server verifies password with **bcrypt**
3. On success, returns a **JWT token** (8hr expiry)
4. Frontend stores token and sends it as `Authorization: Bearer <token>` on all requests
5. `authenticateToken` middleware protects all private routes

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mysql2` | MySQL driver |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `nodemon` | Dev auto-reload |

---

## 📄 License

MIT License © 2026

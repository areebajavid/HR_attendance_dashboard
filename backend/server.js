require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection Pool ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    connectTimeout: 10000
}).promise();

db.getConnection()
  .then(connection => {
    console.log('✅ Connected to the database.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ DATABASE CONNECTION FAILED:', err);
  });

// --- EXISTING ENDPOINTS (UNCHANGED) ---
app.post('/api/login', async (req, res) => { try { const { username, password } = req.body; if (!username || !password) { return res.status(400).json({ error: 'Username and password are required' }); } const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]); if (users.length === 0) { return res.status(401).json({ error: 'Invalid credentials' }); } const user = users[0]; const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) { return res.status(401).json({ error: 'Invalid credentials' }); } const payload = { id: user.id, username: user.username, role: user.role }; const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); res.json({ message: 'Logged in successfully', token }); } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Failed to log in' }); } });
app.get('/api/employees', async (req, res) => { 
    try {
        const sql = `
            SELECT 
                id, 
                employee_name,
                ee_id,
                department,
                reporting_manager,
                position_title
            FROM 
                employees
            ORDER BY
                employee_name ASC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error in /api/employees:", err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});
app.post('/api/leaves/batch', async (req, res) => {
    const { leaves } = req.body;
    if (!leaves || !Array.isArray(leaves) || leaves.length === 0) {
        return res.status(400).json({ error: 'No leaves data provided.' });
    }

    const sql = `
        INSERT INTO leaves (employee_id, leave_date, leave_type) 
        VALUES ? 
        ON DUPLICATE KEY UPDATE leave_type = VALUES(leave_type)
    `;

    const values = leaves.map(leave => [leave.employee_id, leave.leave_date, leave.leave_type]);

    try {
        await db.query(sql, [values]);
        res.status(200).json({ message: 'Leaves saved successfully!' });
    } catch (err) {
        console.error('Batch leave save error:', err);
        res.status(500).json({ error: 'Failed to save leaves.' });
    }
});
app.get('/api/leaves/by-date', async (req, res) => { const { date } = req.query; if (!date) { return res.status(400).json({ error: 'Date query parameter is required.' }); } try { const sql = `SELECT e.ee_id, e.employee_name, e.department, e.position_title, l.leave_type FROM leaves l JOIN employees e ON l.employee_id = e.id WHERE l.leave_date = ?`; const [results] = await db.query(sql, [date]); res.json(results); } catch (err) { res.status(500).json({ error: 'Failed to fetch daily report data.' }); } });
app.get('/api/leaves/summary', async (req, res) => { try { const sql = `SELECT leave_type, COUNT(*) AS count FROM leaves GROUP BY leave_type`; const [results] = await db.query(sql); res.json(results); } catch (err) { console.error('Database query error:', err); res.status(500).json({ error: 'Failed to fetch leave summary' }); } });

// --- ⭐ NEW ENDPOINT FOR GOOGLE SHEETS ⭐ ---
app.get('/api/daily-attendance', async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    
    try {
        const sql = `
            SELECT 
                e.ee_id AS 'Employee ID',
                e.employee_name AS 'Employee Name',
                e.department AS 'Department',
                l.leave_type AS 'Leave Status (from Dashboard)'
            FROM 
                employees e
            LEFT JOIN 
                leaves l ON e.id = l.employee_id AND l.leave_date = ?
            ORDER BY
                e.employee_name ASC;
        `;

        const [results] = await db.query(sql, [today]);
        res.json(results);
        
    } catch (err) {
        console.error('Error fetching daily attendance data:', err);
        res.status(500).json({ error: 'Failed to fetch daily attendance data.' });
    }
});
// NEW ENDPOINT FOR THE LEAVE BALANCE REPORT
// NEW ENDPOINT FOR THE LEAVE BALANCE REPORT
app.get('/api/leave-balances', async (req, res) => {
    try {
        const sql = `
            SELECT
                e.id,
                e.ee_id,
                e.employee_name,
                COUNT(CASE WHEN l.leave_type = 'Earned Leave - EL' THEN 1 END) AS earned_leave,
                COUNT(CASE WHEN l.leave_type = 'Sick Leave - SL' THEN 1 END) AS sick_leave,
                COUNT(CASE WHEN l.leave_type = 'WFH' THEN 1 END) AS wfh,
                COUNT(CASE WHEN l.leave_type = 'Comp Off' THEN 1 END) AS comp_off,
                COUNT(CASE WHEN l.leave_type = 'LWP' THEN 1 END) AS lwp,
                COUNT(CASE WHEN l.leave_type LIKE '%(0.5)%' THEN 1 END) AS half_days,
                COUNT(CASE WHEN l.leave_type = 'Maternity' THEN 1 END) AS maternity,
                COUNT(CASE WHEN l.leave_type = 'Paternity' THEN 1 END) AS paternity,
                COUNT(CASE WHEN l.leave_type = 'Mandatory Holiday' THEN 1 END) AS mandatory_holiday,
                COUNT(CASE WHEN l.leave_type = 'Optional Holiday - OH' THEN 1 END) AS optional_holiday
            FROM
                employees e
            LEFT JOIN
                leaves l ON e.id = l.employee_id AND YEAR(l.leave_date) = YEAR(CURDATE())
            GROUP BY
                e.id, e.ee_id, e.employee_name
            ORDER BY
                e.employee_name ASC;
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error fetching leave balances:", err);
        res.status(500).json({ error: 'Failed to fetch leave balance data' });
    }
});
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
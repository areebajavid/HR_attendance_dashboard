require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// ── DB Pool ────────────────────────────────────────────────────
const db = mysql.createPool({
  host:            process.env.DB_HOST,
  user:            process.env.DB_USER,
  password:        process.env.DB_PASSWORD,
  database:        process.env.DB_NAME,
  port:            process.env.DB_PORT || 3306,
  connectionLimit: 10,
  connectTimeout:  10000,
}).promise();

db.getConnection()
  .then(c => { console.log('✅ Database connected.'); c.release(); })
  .catch(err => console.error('❌ DB connection failed:', err.message));

// ── Auth Middleware ────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// ── Public Routes ──────────────────────────────────────────────
app.get('/api/test-auth', async (req, res) => {
  const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['hr_manager']);
  const user = users[0];
  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare('Hr@1234', user.password);
  res.json({ passwordInDB: user.password, match });
});
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Logged in successfully.', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── Protected Routes (all require valid JWT) ───────────────────
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, employee_name, ee_id, department, reporting_manager, position_title
      FROM employees
      ORDER BY employee_name ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('GET /api/employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees.' });
  }
});

app.post('/api/leaves/batch', authenticateToken, async (req, res) => {
  const { leaves } = req.body;
  if (!Array.isArray(leaves) || leaves.length === 0)
    return res.status(400).json({ error: 'No leave data provided.' });

  try {
    const values = leaves.map(l => [l.employee_id, l.leave_date, l.leave_type]);
    await db.query(
      `INSERT INTO leaves (employee_id, leave_date, leave_type)
       VALUES ?
       ON DUPLICATE KEY UPDATE leave_type = VALUES(leave_type)`,
      [values]
    );
    res.json({ message: 'Leaves saved successfully.' });
  } catch (err) {
    console.error('POST /api/leaves/batch:', err);
    res.status(500).json({ error: 'Failed to save leaves.' });
  }
});

app.get('/api/leaves/by-date', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date query parameter is required.' });

  try {
    const [results] = await db.query(`
      SELECT e.ee_id, e.employee_name, e.department, e.position_title, l.leave_type
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.leave_date = ?
      ORDER BY e.employee_name ASC
    `, [date]);
    res.json(results);
  } catch (err) {
    console.error('GET /api/leaves/by-date:', err);
    res.status(500).json({ error: 'Failed to fetch daily report.' });
  }
});

app.get('/api/leaves/summary', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT leave_type, COUNT(*) AS count
      FROM leaves
      WHERE YEAR(leave_date) = YEAR(CURDATE())
      GROUP BY leave_type
      ORDER BY count DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('GET /api/leaves/summary:', err);
    res.status(500).json({ error: 'Failed to fetch leave summary.' });
  }
});

app.get('/api/leave-balances', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        e.id,
        e.ee_id,
        e.employee_name,
        COUNT(CASE WHEN l.leave_type = 'Earned Leave - EL'         THEN 1 END) AS earned_leave,
        COUNT(CASE WHEN l.leave_type = 'Sick Leave - SL'            THEN 1 END) AS sick_leave,
        COUNT(CASE WHEN l.leave_type = 'WFH'                        THEN 1 END) AS wfh,
        COUNT(CASE WHEN l.leave_type = 'Comp Off'                   THEN 1 END) AS comp_off,
        COUNT(CASE WHEN l.leave_type = 'LWP'                        THEN 1 END) AS lwp,
        COUNT(CASE WHEN l.leave_type LIKE '%(0.5)%'                 THEN 1 END) AS half_days,
        COUNT(CASE WHEN l.leave_type = 'Maternity'                  THEN 1 END) AS maternity,
        COUNT(CASE WHEN l.leave_type = 'Paternity'                  THEN 1 END) AS paternity,
        COUNT(CASE WHEN l.leave_type = 'Mandatory Holiday'          THEN 1 END) AS mandatory_holiday,
        COUNT(CASE WHEN l.leave_type = 'Optional Holiday - OH'      THEN 1 END) AS optional_holiday
      FROM employees e
      LEFT JOIN leaves l
        ON e.id = l.employee_id AND YEAR(l.leave_date) = YEAR(CURDATE())
      GROUP BY e.id, e.ee_id, e.employee_name
      ORDER BY e.employee_name ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('GET /api/leave-balances:', err);
    res.status(500).json({ error: 'Failed to fetch leave balances.' });
  }
});

app.get('/api/daily-attendance', authenticateToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [results] = await db.query(`
      SELECT
        e.ee_id            AS 'Employee ID',
        e.employee_name    AS 'Employee Name',
        e.department       AS 'Department',
        l.leave_type       AS 'Leave Status'
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id AND l.leave_date = ?
      ORDER BY e.employee_name ASC
    `, [today]);
    res.json(results);
  } catch (err) {
    console.error('GET /api/daily-attendance:', err);
    res.status(500).json({ error: 'Failed to fetch daily attendance.' });
  }
});

// ── Reset: delete ALL leave records ───────────────────────────
app.delete('/api/leaves/reset', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM leaves');
    res.json({ message: 'All leave records deleted successfully.' });
  } catch (err) {
    console.error('DELETE /api/leaves/reset:', err);
    res.status(500).json({ error: 'Failed to reset leave records.' });
  }
});


// ── Monthly Export ─────────────────────────────────────────────
app.get('/api/leaves/monthly-report', authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year and month are required.' });

  try {
    const [results] = await db.query(`
      SELECT
        e.ee_id          AS 'EE ID',
        e.employee_name  AS 'Employee Name',
        e.department     AS 'Department',
        e.position_title AS 'Position',
        l.leave_date     AS 'Leave Date',
        l.leave_type     AS 'Leave Type'
      FROM employees e
      JOIN leaves l ON e.id = l.employee_id
      WHERE YEAR(l.leave_date) = ? AND MONTH(l.leave_date) = ?
      ORDER BY e.employee_name ASC, l.leave_date ASC
    `, [year, month]);
    res.json(results);
  } catch (err) {
    console.error('GET /api/leaves/monthly-report:', err);
    res.status(500).json({ error: 'Failed to fetch monthly report.' });
  }
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

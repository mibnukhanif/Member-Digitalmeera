import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('digitalmeera.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    commission REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES users(member_id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES users(member_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );
`);

// Seed Admin & Default Settings
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (member_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)").run('ADMIN', 'Administrator', 'admin@digitalmeera.com', hash, 'admin');
}

const settingsExist = db.prepare("SELECT * FROM settings").all();
if (settingsExist.length === 0) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('commission_per_transaction', '5000');
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('min_withdraw', '50000');
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_digitalmeera_key_2026';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // --- API ROUTES ---

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // Public: Check Commission
  app.get('/api/check-commission/:member_id', (req, res) => {
    const user = db.prepare("SELECT name, commission, status FROM users WHERE member_id = ? AND role = 'member'").get(req.params.member_id);
    if (!user) return res.status(404).json({ error: 'Member not found' });
    res.json(user);
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { name, phone, email, password } = req.body;
    try {
      // Generate Member ID (DMYYYYXXXX)
      const year = new Date().getFullYear();
      const lastUser = db.prepare("SELECT member_id FROM users WHERE member_id LIKE ? ORDER BY id DESC LIMIT 1").get(`DM${year}%`);
      let nextNum = 1;
      if (lastUser) {
        const lastNum = parseInt((lastUser as any).member_id.substring(6));
        nextNum = lastNum + 1;
      }
      const member_id = `DM${year}${nextNum.toString().padStart(4, '0')}`;
      
      const hash = bcrypt.hashSync(password, 10);
      db.prepare("INSERT INTO users (member_id, name, phone, email, password) VALUES (?, ?, ?, ?, ?)").run(member_id, name, phone, email, hash);
      
      res.json({ success: true, member_id });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { emailOrId, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ? OR member_id = ?").get(emailOrId, emailOrId);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = jwt.sign({ id: user.id, member_id: user.member_id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { member_id: user.member_id, name: user.name, role: user.role } });
  });

  // Member: Get Profile
  app.get('/api/member/profile', authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT member_id, name, phone, email, commission, status FROM users WHERE id = ?").get(req.user.id);
    const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE member_id = ?").get(req.user.member_id);
    res.json({ ...user, total_transactions: (txCount as any).count });
  });

  // Member: Update Profile
  app.put('/api/member/profile', authenticateToken, (req: any, res) => {
    const { name, phone, email, password } = req.body;
    try {
      if (password) {
        const hash = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE users SET name = ?, phone = ?, email = ?, password = ? WHERE id = ?").run(name, phone, email, hash, req.user.id);
      } else {
        db.prepare("UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?").run(name, phone, email, req.user.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // Member: Withdraw
  app.post('/api/member/withdraw', authenticateToken, (req: any, res) => {
    const { amount } = req.body;
    const user: any = db.prepare("SELECT commission FROM users WHERE id = ?").get(req.user.id);
    const minWithdraw: any = db.prepare("SELECT value FROM settings WHERE key = 'min_withdraw'").get();
    
    if (amount < parseInt(minWithdraw.value)) {
      return res.status(400).json({ error: `Minimum withdraw is Rp ${minWithdraw.value}` });
    }
    if (user.commission < amount) {
      return res.status(400).json({ error: 'Insufficient commission' });
    }

    db.transaction(() => {
      db.prepare("UPDATE users SET commission = commission - ? WHERE id = ?").run(amount, req.user.id);
      db.prepare("INSERT INTO withdrawals (member_id, amount) VALUES (?, ?)").run(req.user.member_id, amount);
    })();
    res.json({ success: true });
  });

  // Member: Withdraw History
  app.get('/api/member/withdrawals', authenticateToken, (req: any, res) => {
    const withdrawals = db.prepare("SELECT * FROM withdrawals WHERE member_id = ? ORDER BY created_at DESC").all(req.user.member_id);
    res.json(withdrawals);
  });

  // Admin: Dashboard Stats
  app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
    const totalMembers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'member'").get();
    const totalTx = db.prepare("SELECT COUNT(*) as count FROM transactions").get();
    const totalCommission = db.prepare("SELECT SUM(commission) as sum FROM users WHERE role = 'member'").get();
    const totalWithdraw = db.prepare("SELECT SUM(amount) as sum FROM withdrawals WHERE status = 'approved'").get();
    
    res.json({
      totalMembers: (totalMembers as any).count,
      totalTransactions: (totalTx as any).count,
      totalCommission: (totalCommission as any).sum || 0,
      totalWithdraw: (totalWithdraw as any).sum || 0
    });
  });

  // Admin: Scan & Add Commission
  app.post('/api/admin/scan', authenticateToken, isAdmin, (req, res) => {
    const { member_id } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE member_id = ? AND role = 'member'").get(member_id);
    if (!user) return res.status(404).json({ error: 'Member not found' });
    if (user.status !== 'active') return res.status(400).json({ error: 'Member is inactive' });

    const commSetting: any = db.prepare("SELECT value FROM settings WHERE key = 'commission_per_transaction'").get();
    const amount = parseFloat(commSetting.value);

    db.transaction(() => {
      db.prepare("UPDATE users SET commission = commission + ? WHERE member_id = ?").run(amount, member_id);
      db.prepare("INSERT INTO transactions (member_id, amount) VALUES (?, ?)").run(member_id, amount);
    })();

    res.json({ success: true, amount, member_name: user.name });
  });

  // Admin: Get Members
  app.get('/api/admin/members', authenticateToken, isAdmin, (req, res) => {
    const members = db.prepare("SELECT id, member_id, name, phone, email, commission, status, created_at FROM users WHERE role = 'member' ORDER BY created_at DESC").all();
    res.json(members);
  });

  // Admin: Update Member Status
  app.put('/api/admin/members/:id/status', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Admin: Delete Member
  app.delete('/api/admin/members/:id', authenticateToken, isAdmin, (req, res) => {
    const user: any = db.prepare("SELECT member_id FROM users WHERE id = ?").get(req.params.id);
    if(user) {
      db.transaction(() => {
        db.prepare("DELETE FROM transactions WHERE member_id = ?").run(user.member_id);
        db.prepare("DELETE FROM withdrawals WHERE member_id = ?").run(user.member_id);
        db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
      })();
    }
    res.json({ success: true });
  });

  // Admin: Get Withdrawals
  app.get('/api/admin/withdrawals', authenticateToken, isAdmin, (req, res) => {
    const withdrawals = db.prepare(`
      SELECT w.*, u.name 
      FROM withdrawals w 
      JOIN users u ON w.member_id = u.member_id 
      ORDER BY w.created_at DESC
    `).all();
    res.json(withdrawals);
  });

  // Admin: Update Withdrawal Status
  app.put('/api/admin/withdrawals/:id', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    const withdrawal: any = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(req.params.id);
    if (!withdrawal || withdrawal.status !== 'pending') return res.status(400).json({ error: 'Invalid withdrawal' });

    db.transaction(() => {
      db.prepare("UPDATE withdrawals SET status = ? WHERE id = ?").run(status, req.params.id);
      if (status === 'rejected') {
        // Refund commission
        db.prepare("UPDATE users SET commission = commission + ? WHERE member_id = ?").run(withdrawal.amount, withdrawal.member_id);
      }
    })();
    res.json({ success: true });
  });

  // Admin: Get Settings
  app.get('/api/admin/settings', authenticateToken, isAdmin, (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const result = settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(result);
  });

  // Admin: Update Settings
  app.put('/api/admin/settings', authenticateToken, isAdmin, (req, res) => {
    const { commission_per_transaction, min_withdraw, username, password } = req.body;
    db.transaction(() => {
      if (commission_per_transaction) db.prepare("UPDATE settings SET value = ? WHERE key = 'commission_per_transaction'").run(commission_per_transaction);
      if (min_withdraw) db.prepare("UPDATE settings SET value = ? WHERE key = 'min_withdraw'").run(min_withdraw);
      
      if (username || password) {
        let query = "UPDATE users SET ";
        const params = [];
        if (username) { query += "email = ?, "; params.push(username); }
        if (password) { query += "password = ?, "; params.push(bcrypt.hashSync(password, 10)); }
        query = query.slice(0, -2) + " WHERE role = 'admin'";
        db.prepare(query).run(...params);
      }
    })();
    res.json({ success: true });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

// Part 1: Initial Setup and Dependencies
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'newpassword',
  database: process.env.DB_NAME || 'courierdb1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

const pool = mysql.createPool(dbConfig).promise();

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const profileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('profileImage');

const courierUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// Helper Functions
const logActivity = async (userId = null, adminId = null, action, entityType = null, entityId = null, description, ip) => {
  try {
    await pool.execute(
      'CALL LogActivity(?, ?, ?, ?, ?, ?, ?)',
      [userId, adminId, action, entityType, entityId, description, ip]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const createNotification = async (userId = null, adminId = null, type, title, message) => {
  try {
    await pool.execute(
      'CALL CreateNotification(?, ?, ?, ?, ?)',
      [userId, adminId, type, title, message]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const calculateDeliveryDate = (weight) => {
  const date = new Date();
  date.setDate(date.getDate() + (weight > 10 ? 5 : 3));
  return date.toISOString().split('T')[0];
};

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const userId = parseInt(token);
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE u_id = ? AND status = "active"',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    const { password, ...userData } = users[0];
    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// In your server.js

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Get admin by ID (token)
    const [admins] = await pool.execute(
      'SELECT * FROM admin WHERE a_id = ?',
      [token]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid admin token' });
    }

    const { password, ...adminData } = admins[0];
    req.admin = adminData;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};


app.post("/api/admin/tracking-update", authenticateAdmin, async (req, res) => {
  try {
    const { courierId, status, location, description } = req.body;

    if (!courierId || !status || !location || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Update courier status
    await pool.execute(
      'UPDATE courier SET status = ? WHERE c_id = ?',
      [status, courierId]
    );

    // Insert tracking record
    await pool.execute(
      'INSERT INTO courier_tracking (c_id, status, location, description) VALUES (?, ?, ?, ?)',
      [courierId, status, location, description]
    );

    res.json({ 
      success: true, 
      message: 'Tracking updated successfully' 
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update tracking' 
    });
  }
});
// Registration Route
app.post("/api/register", async (req, res) => {
  profileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err instanceof multer.MulterError ? 
          'File upload error: ' + err.message : 
          err.message 
      });
    }

    try {
      const { email, password, name, pnumber, address } = req.body;

      if (!email || !password || !name || !pnumber) {
        if (req.file) {
          fs.unlink(path.join(uploadDir, req.file.filename), () => {});
        }
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const profileImage = req.file ? req.file.filename : null;

      const [result] = await pool.execute(
        'CALL RegisterUser(?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name, pnumber, address, profileImage]
      );

      const userId = result[0][0].userId;

      await logActivity(userId, null, 'registration', 'user', userId, 'New user registration', req.ip);
      await createNotification(userId, null, 'welcome', 'Welcome to FastCourier', 'Thank you for registering with us!');

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: userId,
          email,
          name,
          pnumber,
          address,
          profile_image: profileImage,
          status: 'active'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (req.file) {
        fs.unlink(path.join(uploadDir, req.file.filename), () => {});
      }
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });
});

// Login Route
// In server.js - Login Route
app.post("/api/login", [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Check admin login first
    const [admins] = await pool.execute('CALL GetAdminByEmail(?)', [email]);

    if (admins[0].length > 0) {
      const admin = admins[0][0];
      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      await pool.execute(
        'UPDATE admin SET last_login = CURRENT_TIMESTAMP WHERE a_id = ?',
        [admin.a_id]
      );

      await logActivity(null, admin.a_id, 'login', 'admin', admin.a_id, 'Admin login successful', req.ip);

      const { password: _, ...adminData } = admin;
      return res.json({
        user: { ...adminData, isAdmin: true },
        token: admin.a_id.toString(),
        message: 'Login successful'
      });
    }

    // Check user login
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update login status
    await pool.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE u_id = ?', [user.u_id]);

    const { password: _, ...userData } = user;

    // Return token as user ID
    res.json({
      user: userData,
      token: user.u_id.toString(),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Create Courier Route
app.post("/api/courier",
  authenticateUser,
  (req, res, next) => {
    courierUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err instanceof multer.MulterError ? 
            'File upload error: ' + err.message : 
            err.message 
        });
      }
      next();
    });
  },
  [
    body('semail').isEmail(),
    body('remail').isEmail(),
    body('sname').notEmpty(),
    body('rname').notEmpty(),
    body('sphone').notEmpty(),
    body('rphone').notEmpty(),
    body('saddress').notEmpty(),
    body('raddress').notEmpty(),
    body('weight').isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const {
        semail, remail, sname, rname,
        sphone, rphone, saddress, raddress,
        weight
      } = req.body;

      const billno = Math.floor(100000 + Math.random() * 900000).toString();
      const image = req.file ? req.file.filename : null;
      const date = new Date().toISOString().split('T')[0];
      const expectedDelivery = calculateDeliveryDate(parseFloat(weight));

      // Calculate price
      await pool.execute(
        'CALL CalculateCourierPrice(?, "default", @price)',
        [weight]
      );
      const [priceResult] = await pool.execute('SELECT @price as price');
      const price = priceResult[0]?.price || 0;

      // Insert courier
      const [result] = await pool.execute(
        `INSERT INTO courier (
          u_id, semail, remail, sname, rname, sphone, rphone,
          saddress, raddress, weight, price, billno, image,
          date, status, expected_delivery
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.u_id, semail, remail, sname, rname,
          sphone, rphone, saddress, raddress, weight,
          price, billno, image, date, 'Pending', expectedDelivery
        ]
      );

      const courierId = result.insertId;

      await pool.execute(
        'CALL InsertTrackingUpdate(?, ?, ?, ?)',
        [courierId, 'Pending', null, 'Shipment created']
      );

      await logActivity(
        req.user.u_id,
        null,
        'create_courier',
        'courier',
        courierId,
        `Created courier with bill number ${billno}`,
        req.ip
      );

      await createNotification(
        req.user.u_id,
        null,
        'shipment',
        'Shipment Created',
        `Your shipment with tracking number ${billno} has been created.`
      );

      res.status(201).json({
        message: 'Courier created successfully',
        courier: {
          id: courierId,
          billno,
          price,
          expected_delivery: expectedDelivery
        }
      });
    } catch (error) {
      console.error('Create courier error:', error);
      if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
      res.status(500).json({ message: 'Failed to create courier' });
    }
  }
);

// Get User Couriers
app.get("/api/courier", authenticateUser, async (req, res) => {
  try {
    const [couriers] = await pool.execute(
      `SELECT c.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ct.id,
            'status', ct.status,
            'location', ct.location,
            'description', ct.description,
            'created_at', ct.created_at
          )
        )
        FROM courier_tracking ct
        WHERE ct.c_id = c.c_id
        ORDER BY ct.created_at DESC
        ) as tracking_history
      FROM courier c
      WHERE c.u_id = ?
      ORDER BY c.created_at DESC`,
      [req.user.u_id]
    );

    res.json(couriers);
  } catch (error) {
    console.error('Fetch couriers error:', error);
    res.status(500).json({ message: 'Failed to fetch couriers' });
  }
});

// Get Dashboard Stats
app.get("/api/courier/dashboard", authenticateUser, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_shipments,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_shipments,
        SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as in_transit_shipments,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_shipments,
        SUM(price) as total_spent
      FROM courier
      WHERE u_id = ?
    `, [req.user.u_id]);

    const [recentShipments] = await pool.execute(`
      SELECT c.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'status', ct.status,
            'location', ct.location,
            'description', ct.description,
            'created_at', ct.created_at
          )
        )
        FROM courier_tracking ct
        WHERE ct.c_id = c.c_id
        ORDER BY ct.created_at DESC
        LIMIT 1) as latest_tracking
      FROM courier c
      WHERE c.u_id = ?
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [req.user.u_id]);

    res.json({
      stats: stats[0],
      recentShipments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Calculate Price
// In your server.js
app.post("/api/calculate-price", authenticateUser, async (req, res) => {
  try {
    const { weight, zone = 'default' } = req.body;
    
    if (!weight || isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: 'Invalid weight' });
    }

    await pool.execute('CALL CalculateCourierPrice(?, ?, @price)', [weight, zone]);
    const [result] = await pool.execute('SELECT @price as price');
    
    res.json({ price: result[0]?.price || 0 });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ message: 'Failed to calculate price' });
  }
});
// Track Courier
app.get("/api/courier/track/:billno", async (req, res) => {
  try {
    const [couriers] = await pool.execute(
      `SELECT c.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ct.id,
            'status', ct.status,
            'location', ct.location,
            'description', ct.description,
            'created_at', ct.created_at
          )
        )
        FROM courier_tracking ct
        WHERE ct.c_id = c.c_id
        ORDER BY ct.created_at DESC
        ) as tracking_history
      FROM courier c
      WHERE c.billno = ?`,
      [req.params.billno]
    );

    if (couriers.length === 0) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    res.json(couriers[0]);
  } catch (error) {
    console.error('Track courier error:', error);
    res.status(500).json({ message: 'Failed to track courier' });
  }
});

// Get Courier Details
app.get("/api/courier/:id", authenticateUser, async (req, res) => {
  try {
    const [couriers] = await pool.execute(
      `SELECT c.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ct.id,
            'status', ct.status,
            'location', ct.location,
            'description', ct.description,
            'created_at', ct.created_at
          )
        )
        FROM courier_tracking ct
        WHERE ct.c_id = c.c_id
        ORDER BY ct.created_at DESC
        ) as tracking_history
      FROM courier c
      WHERE c.c_id = ?`,
      [req.params.id]
    );

    if (couriers.length === 0) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    res.json(couriers[0]);
  } catch (error) {
    console.error('Fetch courier error:', error);
    res.status(500).json({ message: 'Failed to fetch courier details' });
  }
});

// Update Tracking
app.post("/api/admin/tracking-update",
  authenticateAdmin,
  async (req, res) => {
    try {
      const { courierId, status, location, description } = req.body;

      await pool.execute(
        'CALL InsertTrackingUpdate(?, ?, ?, ?)',
        [courierId, status, location, description]
      );

      const [couriers] = await pool.execute(
        'SELECT u_id, billno FROM courier WHERE c_id = ?',
        [courierId]
      );

      if (couriers.length > 0) {
        await createNotification(
          couriers[0].u_id,
          req.admin.a_id,
          'shipment',
          'Shipment Status Updated',
          `Your shipment ${couriers[0].billno} status has been updated to ${status}`
        );

        await logActivity(
          null,
          req.admin.a_id,
          'update_tracking',
          'courier',
          courierId,
          `Updated shipment status to ${status}`,
          req.ip
        );
      }

      res.json({ message: 'Tracking updated successfully' });
    } catch (error) {
      console.error('Update tracking error:', error);
      res.status(500).json({ message: 'Failed to update tracking' });
    }
  }
);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File size is too large. Maximum size is 5MB' 
        : err.message 
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ 
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Admin Dashboard Stats
app.get("/api/admin/dashboard", 
  authenticateAdmin,
  async (req, res) => {
    try {
      const [stats] = await pool.execute('CALL GetCourierStats(DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), CURRENT_DATE)');

      const [[userStats]] = await pool.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_users
        FROM users
      `);

      const [recentCouriers] = await pool.execute(`
        SELECT c.*, u.name as user_name
        FROM courier c
        LEFT JOIN users u ON c.u_id = u.u_id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);

      const [[pendingContacts]] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM contacts
        WHERE status = 'new'
      `);

      res.json({
        stats: stats[0][0],
        userStats,
        recentCouriers,
        pendingContacts: pendingContacts.count
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
});

// User Management
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.*,
        COUNT(c.c_id) as total_shipments,
        COALESCE(SUM(c.price), 0) as total_spent,
        MAX(c.created_at) as last_shipment
      FROM users u
      LEFT JOIN courier c ON u.u_id = c.u_id
      GROUP BY u.u_id
      ORDER BY u.created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.put("/api/admin/user/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE users SET status = ? WHERE u_id = ?',
      [status, id]
    );

    // Add notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, admin_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        req.admin.a_id,
        'account',
        'Account Status Updated',
        `Your account status has been updated to ${status}`
      ]
    );

    res.json({ 
      success: true,
      message: 'User status updated successfully' 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});
app.delete("/api/admin/user/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM users WHERE u_id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.get("/api/admin/courier/:id", authenticateAdmin, async (req, res) => {
  try {
    const [couriers] = await pool.execute(`
      SELECT c.*, u.name as user_name,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ct.id,
            'status', ct.status,
            'location', ct.location,
            'description', ct.description,
            'created_at', ct.created_at
          )
        )
        FROM courier_tracking ct
        WHERE ct.c_id = c.c_id
        ORDER BY ct.created_at DESC
      ) as tracking_history
      FROM courier c
      LEFT JOIN users u ON c.u_id = u.u_id
      WHERE c.c_id = ?
    `, [req.params.id]);

    if (couriers.length === 0) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    res.json(couriers[0]);
  } catch (error) {
    console.error('Get courier error:', error);
    res.status(500).json({ message: 'Failed to fetch courier details' });
  }
});
// In your server.js
app.get("/api/admin/pricing", authenticateAdmin, async (req, res) => {
  try {
    const [rules] = await pool.execute(
      'SELECT * FROM pricing ORDER BY weight_from ASC'
    );
    res.json(rules);
  } catch (error) {
    console.error('Fetch pricing error:', error);
    res.status(500).json({ message: 'Failed to fetch pricing rules' });
  }
});

app.post("/api/admin/pricing", authenticateAdmin, async (req, res) => {
  try {
    const { weight_from, weight_to, price_per_kg, zone } = req.body;

    if (!weight_from || !weight_to || !price_per_kg) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await pool.execute(
      'INSERT INTO pricing (weight_from, weight_to, price_per_kg, zone) VALUES (?, ?, ?, ?)',
      [weight_from, weight_to, price_per_kg, zone || 'default']
    );

    res.json({ message: 'Pricing rule added successfully' });
  } catch (error) {
    console.error('Add pricing error:', error);
    res.status(500).json({ message: 'Failed to add pricing rule' });
  }
});

app.put("/api/admin/pricing/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { weight_from, weight_to, price_per_kg, zone } = req.body;

    await pool.execute(
      'UPDATE pricing SET weight_from = ?, weight_to = ?, price_per_kg = ?, zone = ? WHERE id = ?',
      [weight_from, weight_to, price_per_kg, zone, id]
    );

    res.json({ message: 'Pricing rule updated successfully' });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ message: 'Failed to update pricing rule' });
  }
});

app.delete("/api/admin/pricing/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM pricing WHERE id = ?', [id]);
    res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    console.error('Delete pricing error:', error);
    res.status(500).json({ message: 'Failed to delete pricing rule' });
  }
});

app.get("/api/admin/couriers", authenticateAdmin, async (req, res) => {
  try {
    const [couriers] = await pool.execute(`
      SELECT 
        c.*,
        u.name as user_name,
        CAST(c.price AS DECIMAL(10,2)) as price,
        CAST(c.weight AS DECIMAL(10,2)) as weight
      FROM courier c
      LEFT JOIN users u ON c.u_id = u.u_id
      ORDER BY c.created_at DESC
    `);
    
    // Format the data before sending
    const formattedCouriers = couriers.map(courier => ({
      ...courier,
      price: parseFloat(courier.price || 0),
      weight: parseFloat(courier.weight || 0)
    }));

    res.json(formattedCouriers);
  } catch (error) {
    console.error('Fetch couriers error:', error);
    res.status(500).json({ message: 'Failed to fetch couriers' });
  }
});

app.post("/api/admin/tracking-update", authenticateAdmin, async (req, res) => {
  try {
    const { courierId, status, location, description } = req.body;

    // Insert tracking update
    await pool.execute('CALL InsertTrackingUpdate(?, ?, ?, ?)', [
      courierId, status, location, description
    ]);

    // If delivered, update actual delivery date
    if (status === 'Delivered') {
      await pool.execute(`
        UPDATE courier 
        SET actual_delivery = CURRENT_TIMESTAMP
        WHERE c_id = ?
      `, [courierId]);
    }

    // Get courier details for notification
    const [couriers] = await pool.execute(
      'SELECT u_id, billno FROM courier WHERE c_id = ?',
      [courierId]
    );

    if (couriers.length > 0) {
      const courier = couriers[0];
      
      // Create notification for user
      await pool.execute(
        'CALL CreateNotification(?, ?, ?, ?, ?)',
        [
          courier.u_id,
          req.admin.a_id,
          'shipment',
          'Shipment Status Updated',
          `Your shipment ${courier.billno} status has been updated to ${status}`
        ]
      );
    }

    res.json({ 
      success: true,
      message: 'Tracking updated successfully' 
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Failed to update tracking' });
  }
});
// Contact Management
app.get("/api/admin/contacts",
  authenticateAdmin,
  async (req, res) => {
    try {
      const [contacts] = await pool.execute(`
        SELECT c.*, a.name as assigned_to_name
        FROM contacts c
        LEFT JOIN admin a ON c.assigned_to = a.a_id
        ORDER BY 
          CASE c.status
            WHEN 'new' THEN 1
            WHEN 'in_progress' THEN 2
            ELSE 3
          END,
          c.created_at DESC
      `);
      
      res.json(contacts);
    } catch (error) {
      console.error('Fetch contacts error:', error);
      res.status(500).json({ message: 'Failed to fetch contacts' });
    }
});

// Contact Status Update
app.put("/api/admin/contact/:id",
  authenticateAdmin,
  [
    body('status').isIn(['new', 'in_progress', 'resolved', 'closed']),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, priority, assigned_to } = req.body;

      await pool.execute(
        `UPDATE contacts 
         SET status = ?, 
             priority = COALESCE(?, priority),
             assigned_to = ?,
             resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = ?`,
        [status, priority, assigned_to, status, id]
      );

      await logActivity(
        null,
        req.admin.a_id,
        'update_contact',
        'contact',
        id,
        `Updated contact status to ${status}`,
        req.ip
      );

      res.json({ message: 'Contact updated successfully' });
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ message: 'Failed to update contact' });
    }
});

// Activity Logs
app.get("/api/admin/logs",
  authenticateAdmin,
  async (req, res) => {
    try {
      const [logs] = await pool.execute(`
        SELECT l.*,
          u.name as user_name,
          a.name as admin_name
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.u_id
        LEFT JOIN admin a ON l.admin_id = a.a_id
        ORDER BY l.created_at DESC
        LIMIT 100
      `);

      res.json(logs);
    } catch (error) {
      console.error('Fetch logs error:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
});

// Notifications
app.get("/api/notifications",
  authenticateUser,
  async (req, res) => {
    try {
      const [notifications] = await pool.execute(
        'SELECT * FROM notifications WHERE (user_id = ? OR admin_id = ?) ORDER BY created_at DESC LIMIT 50',
        [req.user.u_id, req.user.isAdmin ? req.user.a_id : null]
      );

      res.json(notifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

// Mark Notification as Read
app.put("/api/notifications/:id/read",
  authenticateUser,
  async (req, res) => {
    try {
      await pool.execute(
        'UPDATE notifications SET is_read = true WHERE id = ?',
        [req.params.id]
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Update notification error:', error);
      res.status(500).json({ message: 'Failed to update notification' });
    }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ 
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Start Server
app.listen(PORT, () => {
  console.log(`\n=== Courier Management System Server ===`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API endpoint: http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=====================================\n');
});
module.exports = app;
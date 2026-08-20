require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// ==========================================
// App
// ==========================================

const app = express();

// ==========================================
// Configuration
// ==========================================

const PORT = Number(process.env.PORT) || 4002;

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      FRONTEND_URL,
    ].filter(Boolean),

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// ==========================================
// Security
// ==========================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ==========================================
// Body Parser
// ==========================================

app.use(
  express.json({
    limit: '2mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// Health Check
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UTB API is running',
    port: PORT,
    frontend: FRONTEND_URL,
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

// ==========================================
// OTHER ROUTES
// ==========================================

const courseRoutes = require('./routes/course.routes');
const projectRoutes = require('./routes/project.routes');
const labRoutes = require('./routes/lab.routes');
const progressRoutes = require('./routes/progress.routes');
const challengeRoutes = require('./routes/challenge.routes');

// لا نحذف أي route موجود
app.use('/api/courses', courseRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/challenges', challengeRoutes);

// ==========================================
// 404 API Handler
// ==========================================

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error('API ERROR:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ==========================================
// MongoDB
// ==========================================

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/utb-informatics';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');

    // ==========================================
    // IMPORTANT:
    // Bind explicitly to localhost/127.0.0.1
    // ==========================================

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server is running on http://127.0.0.1:${PORT}`);
      console.log(
        `Health check: http://127.0.0.1:${PORT}/api/health`
      );
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import auth from './routes/auth.js';
import properties from './routes/properties.js';
import content from './routes/content.js';
import enquiries from './routes/enquiries.js';
import settings from './routes/settings.js';
import dashboard from './routes/dashboard.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ahmad-wattoo-real-estate.vercel.app',
];
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, origin);
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.set('trust proxy', 1);

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WATO Backend API is running',
    service: 'Ahmad Wattoo Real Estate API',
    time: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Ahmad Wattoo Real Estate API',
    version: '1.0.0',
    status: 'ok',
    time: new Date().toISOString(),
    endpoints: ['/api/health', '/api/properties'],
  });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    ok: true,
    service: 'Ahmad Wattoo Real Estate API',
    time: new Date().toISOString(),
    database: dbState === 1 ? 'connected' : 'disconnected',
  });
});

app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api', content);
app.use('/api/enquiries', enquiries);
app.use('/api/settings', settings);
app.use('/api/dashboard', dashboard);

app.use(notFound);

app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next(err);
});

app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`API running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server: MongoDB connection failed.', err.message);
      process.exit(1);
    });
}

export default app;

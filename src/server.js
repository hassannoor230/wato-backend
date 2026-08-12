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

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((x) => x.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('CORS blocked'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRouter from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    // Cleanup legacy/conflicting indexes once at startup (idempotent)
    try {
      const db = mongoose.connection.db;
      const usersCol = db.collection('users');
      const indexes = await usersCol.indexes();
      const legacy = indexes.find((idx) => idx.name === 'username_1');
      if (legacy) {
        await usersCol.dropIndex('username_1');
        console.log('Dropped legacy index username_1 on users collection');
      }
    } catch (idxErr) {
      console.warn('Index check/drop skipped or failed:', idxErr?.message || idxErr);
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();



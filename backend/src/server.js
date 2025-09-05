import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRouter from './routes/auth.routes.js';
import patientRouter from './routes/patient.routes.js';
import photoRouter from './routes/photo.routes.js';
import { initGridFS } from './utils/gridfs.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
  console.log('Test endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ 
    status: 'ok', 
    message: 'Test endpoint working',
    body: req.body,
    authHeader: req.headers.authorization
  });
});

app.use('/api/auth', authRouter);
app.use('/api/patients', patientRouter);
app.use('/api/photos', photoRouter);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    // Initialize GridFS
    initGridFS();
    console.log('GridFS initialized');
    // Cleanup legacy/conflicting indexes once at startup (idempotent)
    try {
      const db = mongoose.connection.db;
      
      // Clean up users collection
      const usersCol = db.collection('users');
      const usersIndexes = await usersCol.indexes();
      const legacyUserIndex = usersIndexes.find((idx) => idx.name === 'username_1');
      if (legacyUserIndex) {
        await usersCol.dropIndex('username_1');
        console.log('Dropped legacy index username_1 on users collection');
      }
      
      // Clean up patients collection
      const patientsCol = db.collection('patients');
      const patientsIndexes = await patientsCol.indexes();
      const legacyPatientIndex = patientsIndexes.find((idx) => idx.name === 'patientId_1');
      if (legacyPatientIndex) {
        await patientsCol.dropIndex('patientId_1');
        console.log('Dropped legacy index patientId_1 on patients collection');
      }
      
      // Clean up duplicate tcId index
      const duplicateTcIdIndex = patientsIndexes.find((idx) => idx.name === 'tcId_1');
      if (duplicateTcIdIndex) {
        await patientsCol.dropIndex('tcId_1');
        console.log('Dropped duplicate index tcId_1 on patients collection');
      }
      
      // Clean up email unique index
      const emailIndex = patientsIndexes.find((idx) => idx.name === 'email_1');
      if (emailIndex) {
        await patientsCol.dropIndex('email_1');
        console.log('Dropped email unique index on patients collection');
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



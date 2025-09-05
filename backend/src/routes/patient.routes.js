import express from 'express';
import {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients
} from '../controllers/patient.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/patients - Get all patients
router.get('/', getAllPatients);

// GET /api/patients/search?q=term - Search patients
router.get('/search', searchPatients);

// GET /api/patients/:id - Get single patient
router.get('/:id', getPatient);

// POST /api/patients - Create new patient
router.post('/', createPatient);

// PUT /api/patients/:id - Update patient
router.put('/:id', updatePatient);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', deletePatient);

export default router;

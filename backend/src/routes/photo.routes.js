import express from 'express';
import {
  uploadPhotos,
  getPhoto,
  deletePhoto,
  getPatientPhotos
} from '../controllers/photo.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload, processImages } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/photos/upload - Upload photos
router.post('/upload', upload.array('photos', 10), processImages, uploadPhotos);

// GET /api/photos/:id - Get photo file
router.get('/:id', getPhoto);

// DELETE /api/photos/:id - Delete photo
router.delete('/:id', deletePhoto);

// GET /api/photos/patient/:patientId - Get patient photos
router.get('/patient/:patientId', getPatientPhotos);

export default router;

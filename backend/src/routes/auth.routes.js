import { Router } from 'express';
import { register, verifyEmail, resendVerification, login, me, logout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.get('/me', me);
router.post('/logout', logout);

export default router;



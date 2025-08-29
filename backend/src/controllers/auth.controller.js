import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { initEmail, sendVerificationEmail } from '../utils/email.js';

const jwtCookieName = 'auth_token';

function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(jwtCookieName, token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Eksik alanlar' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'E-posta zaten kayıtlı' });

    const passwordHash = await User.hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      passwordHash,
      isEmailVerified: false,
      verification: { token: verificationToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    initEmail();
    await sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      clientOrigin: process.env.CLIENT_ORIGIN?.split(',')[0] || 'http://localhost:3000',
    });

    res.status(201).json({ message: 'Kayıt başarılı. E-posta doğrulaması gönderildi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.verification) return res.status(400).json({ message: 'Geçersiz bağlantı' });
    if (user.verification.expiresAt < new Date()) return res.status(400).json({ message: 'Bağlantı süresi dolmuş' });
    if (user.verification.token !== token) return res.status(400).json({ message: 'Token geçersiz' });

    user.isEmailVerified = true;
    user.verification = undefined;
    await user.save();

    const jwtToken = signToken(user);
    setAuthCookie(res, jwtToken);
    res.json({ message: 'E-posta doğrulandı', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'E-posta zaten doğrulandı' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verification = { token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    await user.save();

    initEmail();
    await sendVerificationEmail({
      to: user.email,
      token,
      clientOrigin: process.env.CLIENT_ORIGIN?.split(',')[0] || 'http://localhost:3000',
    });

    res.json({ message: 'Doğrulama e-postası tekrar gönderildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Geçersiz bilgiler' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Geçersiz bilgiler' });
    if (!user.isEmailVerified) return res.status(403).json({ message: 'Lütfen e-posta doğrulayın' });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ message: 'Giriş başarılı', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const me = async (req, res) => {
  try {
    const token = req.cookies?.[jwtCookieName];
    if (!token) return res.status(401).json({ authenticated: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('name email isEmailVerified');
    if (!user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie(jwtCookieName, { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Çıkış yapıldı' });
};



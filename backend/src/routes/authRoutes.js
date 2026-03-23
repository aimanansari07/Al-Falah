const router      = require('express').Router();
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const auth        = require('../middleware/auth');
const { Admin }   = require('../models');
const { sendOTP } = require('../utils/mailer');

const NOW = () => Date.now();

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    // Login lockout check
    if (admin.loginLockoutUntil && NOW() < admin.loginLockoutUntil) {
      const mins = Math.ceil((admin.loginLockoutUntil - NOW()) / 60000);
      return res.status(429).json({
        error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        locked: true,
        retryAfter: admin.loginLockoutUntil,
      });
    }

    const valid = bcrypt.compareSync(password, admin.passwordHash);

    if (!valid) {
      const attempts = (admin.loginAttempts || 0) + 1;
      if (attempts >= 5) {
        const lockUntil = NOW() + 15 * 60 * 1000;
        await Admin.updateOne({}, { $set: { loginAttempts: 0, loginLockoutUntil: lockUntil } });
        return res.status(429).json({
          error: 'Account locked for 15 minutes due to too many failed attempts.',
          locked: true,
          retryAfter: lockUntil,
        });
      }
      await Admin.updateOne({}, { $set: { loginAttempts: attempts } });
      const left = 5 - attempts;
      return res.status(401).json({
        error: `Invalid credentials. ${left} attempt${left !== 1 ? 's' : ''} remaining.`,
      });
    }

    // Success — reset counters
    await Admin.updateOne({}, { $set: { loginAttempts: 0, loginLockoutUntil: 0 } });

    const token = jwt.sign(
      { sub: admin.username, ver: admin.tokenVersion || 1 },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, isSetupComplete: !!admin.isSetupComplete });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────
// POST /api/auth/setup  (first-time only)
// ─────────────────────────────────────────
router.post('/setup', async (req, res, next) => {
  try {
    const admin = await Admin.findOne({});
    if (admin && admin.isSetupComplete)
      return res.status(403).json({ error: 'Setup already completed' });

    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ error: 'Email and new password required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });

    const hash = bcrypt.hashSync(newPassword, 10);
    await Admin.updateOne({}, { $set: { email, passwordHash: hash, isSetupComplete: true } });

    const updated = await Admin.findOne({});
    const token = jwt.sign(
      { sub: updated.username, ver: updated.tokenVersion || 1 },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, message: 'Setup complete. Welcome!' });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────
// PUT /api/auth/change-password  (authenticated)
// ─────────────────────────────────────────
router.put('/change-password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both fields required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const admin = await Admin.findOne({});
    if (!bcrypt.compareSync(currentPassword, admin.passwordHash))
      return res.status(401).json({ error: 'Current password is incorrect' });

    if (bcrypt.compareSync(newPassword, admin.passwordHash))
      return res.status(400).json({ error: 'New password must be different from current password' });

    const hash   = bcrypt.hashSync(newPassword, 10);
    const newVer = (admin.tokenVersion || 1) + 1;
    await Admin.updateOne({}, { $set: { passwordHash: hash, tokenVersion: newVer } });

    res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const admin = await Admin.findOne({});

    // Prevent email enumeration — always return same message for wrong email
    if (!admin || admin.email !== email) {
      return res.json({ message: 'If that email is registered, you will receive an OTP.' });
    }

    // Check OTP lockout
    if (admin.otpLockoutUntil && NOW() < admin.otpLockoutUntil) {
      const mins = Math.ceil((admin.otpLockoutUntil - NOW()) / 60000);
      return res.status(429).json({
        error: `Too many OTP attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        locked: true,
        retryAfter: admin.otpLockoutUntil,
      });
    }

    const otp     = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = bcrypt.hashSync(otp, 8);
    const otpExp  = NOW() + 10 * 60 * 1000; // 10 minutes

    await Admin.updateOne({}, { $set: { otpHash, otpExpires: otpExp, otpAttempts: 0, otpLockoutUntil: 0 } });

    const result = await sendOTP(email, otp);

    const response = { message: 'OTP sent to your email. Valid for 10 minutes.' };
    // Dev-only: return OTP when email is not configured
    if (result.preview) response.devOtp = otp;

    res.json(response);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const admin = await Admin.findOne({});
    if (!admin || admin.email !== email)
      return res.status(400).json({ error: 'Invalid request' });

    // Lockout check
    if (admin.otpLockoutUntil && NOW() < admin.otpLockoutUntil) {
      const mins = Math.ceil((admin.otpLockoutUntil - NOW()) / 60000);
      return res.status(429).json({
        error: `Locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        locked: true,
      });
    }

    // Expiry check
    if (!admin.otpHash || NOW() > admin.otpExpires)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });

    const valid = bcrypt.compareSync(String(otp), admin.otpHash);

    if (!valid) {
      const attempts = (admin.otpAttempts || 0) + 1;
      if (attempts >= 3) {
        const lockUntil = NOW() + 30 * 60 * 1000;
        await Admin.updateOne({}, { $set: { otpAttempts: 0, otpLockoutUntil: lockUntil, otpHash: null } });
        return res.status(429).json({
          error: 'Too many incorrect attempts. Locked for 30 minutes.',
          locked: true,
        });
      }
      await Admin.updateOne({}, { $set: { otpAttempts: attempts } });
      const left = 3 - attempts;
      return res.status(400).json({ error: `Incorrect OTP. ${left} attempt${left !== 1 ? 's' : ''} remaining.` });
    }

    // Valid — clear OTP, issue 15-min reset token
    await Admin.updateOne({}, { $set: { otpHash: null, otpAttempts: 0, otpExpires: 0 } });

    const resetToken = jwt.sign(
      { sub: 'reset', purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ resetToken });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return res.status(400).json({ error: 'Reset token and new password required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Reset link expired. Please request a new OTP.' });
    }
    if (payload.purpose !== 'password_reset')
      return res.status(401).json({ error: 'Invalid token' });

    const admin  = await Admin.findOne({});
    const hash   = bcrypt.hashSync(newPassword, 10);
    const newVer = (admin.tokenVersion || 1) + 1;

    // Increment tokenVersion → all existing sessions are invalidated
    await Admin.updateOne({}, { $set: { passwordHash: hash, tokenVersion: newVer, otpHash: null } });

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) { next(err); }
});

module.exports = router;

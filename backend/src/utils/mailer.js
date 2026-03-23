// Email utility — uses Gmail SMTP when configured, falls back to console log in dev
// To enable: set SMTP_USER and SMTP_PASS in .env (use a Gmail App Password)

let nodemailer;
try { nodemailer = require('nodemailer'); } catch { nodemailer = null; }

function getTransporter() {
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!nodemailer || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendOTP(toEmail, otp) {
  const transporter = getTransporter();

  if (!transporter) {
    // Email not configured yet — print to console for testing
    console.log('\n' + '─'.repeat(40));
    console.log(`📧  OTP for ${toEmail}: ${otp}`);
    console.log('─'.repeat(40) + '\n');
    return { preview: true };
  }

  await transporter.sendMail({
    from: `"Al-Falah Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Al-Falah Admin — Password Reset OTP',
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:28px;background:#f9f9f9;border-radius:14px">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:40px">🕌</div>
          <h2 style="color:#1A5C38;margin:8px 0 4px">Al-Falah Masjid</h2>
          <p style="color:#9CA3AF;font-size:13px;margin:0">Admin Panel — Password Reset</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;border:1px solid #EEEBE4">
          <p style="color:#6B7280;margin:0 0 12px">Your one-time password is:</p>
          <div style="font-size:40px;font-weight:900;letter-spacing:10px;color:#1A5C38">${otp}</div>
          <p style="color:#9CA3AF;font-size:12px;margin:12px 0 0">Valid for 10 minutes &nbsp;·&nbsp; Do not share this code</p>
        </div>
        <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = { sendOTP };

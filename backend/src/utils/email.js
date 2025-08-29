import sgMail from '@sendgrid/mail';

const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const appName = process.env.APP_NAME || 'Estetik Klinik';

export function initEmail() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('SENDGRID_API_KEY is not set');
  sgMail.setApiKey(apiKey);
}

export async function sendVerificationEmail({ to, token, clientOrigin }) {
  const verifyUrl = `${clientOrigin.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  const msg = {
    to,
    from: fromEmail,
    subject: `${appName} - E-posta Doğrulama`,
    text: `Hesabınızı doğrulamak için bu bağlantıya tıklayın: ${verifyUrl}`,
    html: `<p>Merhaba,</p><p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın.</p><p><a href="${verifyUrl}" style="background:#0ea5e9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">E-postayı Doğrula</a></p><p>Bağlantı 24 saat içinde geçerlidir.</p>`,
  };
  await sgMail.send(msg);
}



import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyLink = `${baseUrl}/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"UniStore Dev" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Confirma tu correo en UniStore Dev',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
        <h2 style="color: #818cf8;">¡Hola, ${name}!</h2>
        <p style="color: #cbd5e1; font-size: 14px;">
          Gracias por registrarte en <strong>UniStore Dev</strong>. Haz clic en el siguiente botón para verificar tu correo y activar tu cuenta:
        </p>
        <a href="${verifyLink}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; font-weight: bold; border-radius: 10px;">
          Verificar mi correo
        </a>
        <p style="color: #64748b; font-size: 12px;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>
    `,
  });
}
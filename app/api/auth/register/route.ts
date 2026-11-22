import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    const cleanEmail = email.trim().toLowerCase();
    const validRole = role === 'desarrollador' ? 'desarrollador' : 'cliente';

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Este correo ya está registrado.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified, verification_token)
       VALUES ($1, $2, $3, $4, FALSE, $5)`,
      [name.trim(), cleanEmail, passwordHash, validRole, verificationToken]
    );

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await sendVerificationEmail(cleanEmail, name.trim(), verificationToken);
    }

    return NextResponse.json({
      message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error al registrar usuario en la base de datos.' }, { status: 500 });
  }
}
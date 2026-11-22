import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja.' },
        { status: 403 }
      );
    }

    const initials = user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: initials || 'US',
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error conectando con la base de datos.' }, { status: 500 });
  }
}
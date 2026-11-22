import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/?verified=error`);
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET email_verified = TRUE, verification_token = NULL
       WHERE verification_token = $1
       RETURNING id`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(`${baseUrl}/?verified=invalid`);
    }

    return NextResponse.redirect(`${baseUrl}/?verified=success`);
  } catch (error) {
    console.error('Error verificando correo:', error);
    return NextResponse.redirect(`${baseUrl}/?verified=error`);
  }
}
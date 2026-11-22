import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY id DESC'
    );
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return NextResponse.json({ error: 'Error al consultar usuarios.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, role } = await request.json();
    if (!['cliente', 'desarrollador', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 });
    }

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    return NextResponse.json({ message: 'Rol actualizado correctamente.' });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    return NextResponse.json({ error: 'Error al actualizar rol.' }, { status: 500 });
  }
}
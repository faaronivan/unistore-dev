import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM app_reviews ORDER BY created_at DESC'
    );

    const reviews = rows.map((row) => ({
      id: `rev-${row.id}`,
      appId: row.app_id,
      user: row.user_name,
      userEmail: row.user_email,
      avatar: row.avatar,
      rating: Number(row.rating),
      date: new Date(row.created_at).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      comment: row.comment,
    }));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error GET /api/reviews:', error);
    return NextResponse.json({ error: 'Error al cargar comentarios' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { appId, userName, userEmail, avatar, rating, comment } = await req.json();

    if (!appId || !userEmail || !comment) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO app_reviews (app_id, user_name, user_email, avatar, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [appId, userName, userEmail.toLowerCase(), avatar || 'US', Number(rating), comment]
    );

    const row = rows[0];
    return NextResponse.json({
      review: {
        id: `rev-${row.id}`,
        appId: row.app_id,
        user: row.user_name,
        userEmail: row.user_email,
        avatar: row.avatar,
        rating: Number(row.rating),
        date: 'Justo ahora',
        comment: row.comment,
      },
    });
  } catch (error) {
    console.error('Error POST /api/reviews:', error);
    return NextResponse.json({ error: 'Error al publicar comentario' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('id');
    const email = searchParams.get('email')?.toLowerCase();

    if (!rawId || !rawId.startsWith('rev-') || !email) {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
    }

    const numericId = Number(rawId.replace('rev-', ''));

    const userRes = await pool.query(
      'SELECT role FROM users WHERE LOWER(email) = $1',
      [email]
    );
    const isAdmin = userRes.rows[0]?.role === 'admin';

    const revRes = await pool.query(
      'SELECT user_email FROM app_reviews WHERE id = $1',
      [numericId]
    );
    if (revRes.rows.length === 0) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    const isOwner = revRes.rows[0].user_email.toLowerCase() === email;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'No tienes permiso para borrar este comentario' }, { status: 403 });
    }

    await pool.query('DELETE FROM app_reviews WHERE id = $1', [numericId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error DELETE /api/reviews:', error);
    return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 });
  }
}
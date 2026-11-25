import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_apps ORDER BY created_at DESC'
    );

    const apps = rows.map((row) => ({
      id: `db-${row.id}`,
      name: row.name,
      developer: row.developer,
      category: row.category,
      price: Number(row.price),
      rating: 5.0,
      downloads: Number(row.downloads),
      version: row.version,
      releaseDate: row.release_date,
      size: row.size,
      shortDesc: row.short_desc,
      description: row.description,
      iconBg: row.icon_bg,
      iconName: row.icon_name || 'Code2',
      tags: row.tags || [],
      screenshots: row.screenshots || [],
      requirements: row.requirements || {
        os: 'Windows 10/11 o Linux',
        processor: 'Intel Core i3 o superior',
        memory: '4 GB RAM',
        storage: '100 MB disponibles',
      },
      releaseNotes: row.release_notes || '',
      reviews: [],
      ownerEmail: row.owner_email,
    }));

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error GET /api/apps:', error);
    return NextResponse.json({ error: 'Error al cargar aplicaciones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      developer,
      category,
      price,
      version,
      size,
      shortDesc,
      description,
      iconBg,
      iconName,
      tags,
      screenshots,
      requirements,
      releaseNotes,
      ownerEmail,
    } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const releaseDate = new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `INSERT INTO user_apps (
        name, developer, category, price, version, size,
        short_desc, description, icon_bg, icon_name,
        tags, screenshots, requirements, release_notes, release_date, owner_email
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        name,
        developer,
        category,
        Number(price) || 0,
        version || '1.0.0',
        size || '35 MB',
        shortDesc,
        description,
        iconBg,
        iconName || 'Code2',
        tags || [],
        screenshots || [],
        JSON.stringify(requirements || {}),
        releaseNotes || '',
        releaseDate,
        ownerEmail.toLowerCase(),
      ]
    );

    const row = rows[0];
    return NextResponse.json({
      app: {
        id: `db-${row.id}`,
        name: row.name,
        developer: row.developer,
        category: row.category,
        price: Number(row.price),
        rating: 5.0,
        downloads: Number(row.downloads),
        version: row.version,
        releaseDate: row.release_date,
        size: row.size,
        shortDesc: row.short_desc,
        description: row.description,
        iconBg: row.icon_bg,
        iconName: row.icon_name,
        tags: row.tags,
        screenshots: row.screenshots,
        requirements: row.requirements,
        releaseNotes: row.release_notes,
        reviews: [],
        ownerEmail: row.owner_email,
      },
    });
  } catch (error) {
    console.error('Error POST /api/apps:', error);
    return NextResponse.json({ error: 'Error al guardar la aplicación' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('id');
    const email = searchParams.get('email')?.toLowerCase();

    if (!rawId || !rawId.startsWith('db-') || !email) {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
    }

    const numericId = Number(rawId.replace('db-', ''));

    // Verificar si es admin en PostgreSQL
    const userRes = await pool.query(
      'SELECT role FROM users WHERE LOWER(email) = $1',
      [email]
    );
    const isAdmin = userRes.rows[0]?.role === 'admin';

    const appRes = await pool.query(
      'SELECT owner_email FROM user_apps WHERE id = $1',
      [numericId]
    );
    if (appRes.rows.length === 0) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }

    const isOwner = appRes.rows[0].owner_email.toLowerCase() === email;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar esta app' }, { status: 403 });
    }

    await pool.query('DELETE FROM user_apps WHERE id = $1', [numericId]);
    await pool.query('DELETE FROM app_reviews WHERE app_id = $1', [rawId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error DELETE /api/apps:', error);
    return NextResponse.json({ error: 'Error al eliminar la aplicación' }, { status: 500 });
  }
}
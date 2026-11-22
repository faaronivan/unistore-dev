import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, price } = body;

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno.' },
        { status: 200 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: [
          {
            id: String(id),
            title: `UniStore Dev - ${title}`,
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'MXN',
          },
        ],
        back_urls: {
          success: `${origin}/app/${id}?status=approved`,
          failure: `${origin}/app/${id}?status=failure`,
          pending: `${origin}/app/${id}?status=pending`,
        },
        // auto_return: 'approved', (DESACTIVADO SOLO EN LOCAL, LO ACTIVARE AL SUBIRLO A UNA PAGINA)
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error procesando el pago' },
      { status: 500 }
    );
  }
}
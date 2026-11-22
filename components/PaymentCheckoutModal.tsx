'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, ShieldCheck, Wallet, Loader2, ExternalLink } from 'lucide-react';

export default function PaymentCheckoutModal() {
  const { checkoutApp, setCheckoutApp, notify } = useStore();
  const [loading, setLoading] = useState(false);

  if (!checkoutApp) return null;

  const handleMercadoPagoRedirect = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: checkoutApp.id,
          title: checkoutApp.name,
          price: checkoutApp.price,
        }),
      });

      const data = await res.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        notify(data.error || 'No se pudo generar el enlace de Mercado Pago. Revisa tu MP_ACCESS_TOKEN.');
        setLoading(false);
      }
    } catch {
      notify('Error conectando con el servidor de pagos.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={() => setCheckoutApp(null)}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Checkout Seguro
          </span>
          <h3 className="mt-1 text-xl font-bold text-white">{checkoutApp.name}</h3>
          <p className="text-xs text-slate-400">Por {checkoutApp.developer}</p>
        </div>

        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Método de pago</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Wallet className="h-4 w-4" />
              Mercado Pago
            </span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total a pagar:</span>
            <span className="text-xl font-extrabold text-white">
              ${checkoutApp.price}.00 MXN
            </span>
          </div>
        </div>

        <p className="mb-5 text-xs leading-relaxed text-slate-400">
          Serás redirigido a la plataforma oficial de Mercado Pago para completar tu compra con tarjeta, saldo en cuenta o efectivo.
        </p>

        <button
          type="button"
          onClick={handleMercadoPagoRedirect}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirigiendo a Mercado Pago...
            </>
          ) : (
            <>
              <span>Pagar con Mercado Pago (${checkoutApp.price} MXN)</span>
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Pago procesado de forma segura por Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}
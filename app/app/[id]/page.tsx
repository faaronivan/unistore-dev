'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ArrowLeft,
  Star,
  Download,
  ShoppingCart,
  Cpu,
  HardDrive,
  Monitor,
  Send,
} from 'lucide-react';

export default function AppDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { apps, purchasedIds, downloadingIds, startDownload, setCheckoutApp, addReview } =
    useStore();

  const app = apps.find((a) => a.id === params.id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!app) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400">Aplicación no encontrada.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const isOwned = app.price === 0 || purchasedIds.includes(app.id);
  const progress = downloadingIds[app.id];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview(app.id, rating, comment);
    setComment('');
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </button>

      {/* Cabecera de la Aplicación */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${app.iconBg} text-2xl font-extrabold text-white shadow-lg`}
          >
            {app.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300">
              {app.category}
            </span>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">{app.name}</h1>
            <p className="text-sm text-slate-400">
              Desarrollado por <span className="font-semibold text-slate-200">{app.developer}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                {app.rating} / 5.0
              </span>
              <span>• {app.downloads} descargas</span>
              <span>• Versión {app.version}</span>
              <span>• {app.size}</span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          {progress !== undefined ? (
            <div className="w-full sm:w-48">
              <div className="mb-1 flex justify-between text-xs text-indigo-300">
                <span>Descargando paquete...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : isOwned ? (
            <button
              onClick={() => startDownload(app)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Descargar Instalador ({app.size})
            </button>
          ) : (
            <button
              onClick={() => setCheckoutApp(app)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              Comprar por ${app.price} MXN
            </button>
          )}
        </div>
      </div>

      {/* Capturas de pantalla */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Capturas del Programa</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {app.screenshots.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${app.name} screenshot ${idx + 1}`}
              className="h-60 w-full rounded-2xl border border-slate-800 object-cover"
            />
          ))}
        </div>
      </section>

      {/* Descripción y Requisitos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Acerca de este software</h2>
          <p className="text-sm leading-relaxed text-slate-300">{app.description}</p>

          <div className="pt-4">
            <h3 className="text-sm font-bold text-white">Notas de la versión ({app.version})</h3>
            <p className="mt-1 text-xs text-slate-400">{app.releaseNotes}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-bold text-white">Requisitos del Sistema</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Monitor className="h-4 w-4 shrink-0 text-indigo-400" />
              <div>
                <p className="font-semibold text-slate-200">Sistema Operativo</p>
                <p className="text-slate-400">{app.requirements.os}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Cpu className="h-4 w-4 shrink-0 text-indigo-400" />
              <div>
                <p className="font-semibold text-slate-200">Procesador y RAM</p>
                <p className="text-slate-400">
                  {app.requirements.processor} • {app.requirements.memory}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HardDrive className="h-4 w-4 shrink-0 text-indigo-400" />
              <div>
                <p className="font-semibold text-slate-200">Almacenamiento</p>
                <p className="text-slate-400">{app.requirements.storage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reseñas y Caja de Comentarios */}
      <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold text-white">
          Reseñas y Calificaciones ({app.reviews.length})
        </h2>

        <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-xl bg-slate-950 p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Tu calificación:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu opinión sobre el programa de tu compañero..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              <Send className="h-3.5 w-3.5" />
              Comentar
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {app.reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-300">
                    {rev.avatar}
                  </span>
                  <span className="text-xs font-bold text-white">{rev.user}</span>
                  <span className="text-[11px] text-slate-500">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span className="text-xs font-bold">{rev.rating}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-300">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
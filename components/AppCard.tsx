'use client';

import React from 'react';
import Link from 'next/link';
import { AppItem } from '@/types/app';
import { useStore } from '@/context/StoreContext';
import {
  Star,
  Download,
  ShoppingCart,
  Trash2,
  Gamepad2,
  Trophy,
  ShieldAlert,
  Bot,
  Mic,
  Utensils,
  BookOpen,
  Compass,
  Code2,
} from 'lucide-react';

const ICON_MAP = {
  Gamepad2,
  Trophy,
  ShieldAlert,
  Bot,
  Mic,
  Utensils,
  BookOpen,
  Compass,
  Code2,
};

export default function AppCard({ app }: { app: AppItem }) {
  const { user, purchasedIds, downloadingIds, startDownload, setCheckoutApp, deleteApp } =
    useStore();
  const IconComponent = ICON_MAP[app.iconName] || Code2;

  const isOwned = app.price === 0 || purchasedIds.includes(app.id);
  const progress = downloadingIds[app.id];

  const canDelete = Boolean(
    user &&
      app.ownerEmail &&
      (user.role === 'admin' ||
        user.email.toLowerCase() === app.ownerEmail.toLowerCase())
  );

  const handleDelete = () => {
    if (confirm(`¿Seguro que quieres eliminar "${app.name}"?`)) {
      deleteApp(app.id);
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/app/${app.id}`} className="flex items-center gap-3.5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.iconBg} text-white shadow-md`}
            >
              {app.iconName !== 'Code2' && <IconComponent className="h-7 w-7" />}
            </div>
            <div>
              <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                {app.category}
              </span>
              <h3 className="mt-1 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                {app.name}
              </h3>
              <p className="text-xs text-slate-400">{app.developer}</p>
            </div>
          </Link>

          {canDelete && (
            <button
              onClick={handleDelete}
              title="Eliminar programa"
              className="rounded-lg border border-white/25 bg-white/10 p-1.5 text-white transition hover:border-rose-500 hover:bg-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-300">
          {app.shortDesc}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {app.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-950/70 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800/80 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              {app.rating}
            </span>
            <span>•</span>
            <span>{app.downloads} descargas</span>
          </div>

          {progress !== undefined ? (
            <div className="w-28">
              <div className="mb-1 flex justify-between text-[10px] text-indigo-300">
                <span>Bajando...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : isOwned ? (
            <button
              onClick={() => startDownload(app)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-600 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {app.price === 0 ? 'Gratis • Bajar' : 'Descargar'}
            </button>
          ) : (
            <button
              onClick={() => setCheckoutApp(app)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              ${app.price} MXN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
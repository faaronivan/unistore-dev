'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import AppCard from '@/components/AppCard';

export default function ProfilePage() {
  const { user, apps, purchasedIds } = useStore();

  if (!user) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Inicia sesión para ver tu biblioteca de programas adquiridos.
      </div>
    );
  }

  const ownedApps = apps.filter((a) => purchasedIds.includes(a.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white">
          {user.avatar}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-xs text-slate-400">{user.email} • {user.role}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Mi Biblioteca de Programas ({ownedApps.length})
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ownedApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </div>
  );
}
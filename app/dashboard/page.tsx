'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import AppCard from '@/components/AppCard';
import { Shield, Code2, User, PlusCircle, CheckCircle2, XCircle } from 'lucide-react';
import { UserRole } from '@/types/app';

interface DbUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
}

export default function DashboardPage() {
  const { user, apps, purchasedIds, setIsUploadOpen, notify } = useStore();
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoadingUsers(true);
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.users) setDbUsers(data.users);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [user]);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setDbUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      notify(`Rol actualizado a ${newRole}.`);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-sm text-slate-400">
          Inicia sesión para acceder a tu Panel de Control (Backend).
        </p>
      </div>
    );
  }

  const ownedApps = apps.filter((a) => purchasedIds.includes(a.id));

  return (
    <div className="space-y-8">
      {/* Cabecera de Perfil y Rol */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold uppercase text-indigo-300 border border-indigo-500/30">
                {user.role === 'admin' && <Shield className="h-3.5 w-3.5" />}
                {user.role === 'desarrollador' && <Code2 className="h-3.5 w-3.5" />}
                {user.role === 'cliente' && <User className="h-3.5 w-3.5" />}
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email} • Correo verificado</p>
          </div>
        </div>

        {(user.role === 'desarrollador' || user.role === 'admin') && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            Publicar Nueva App
          </button>
        )}
      </div>

      {/* PANEL EXCLUSIVO DE ADMINISTRADOR */}
      {user.role === 'admin' && (
        <section className="space-y-4 rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6">
          <h2 className="text-lg font-bold text-white">
            Panel de Administrador — Usuarios en PostgreSQL
          </h2>
          {loadingUsers ? (
            <p className="text-xs text-slate-400">Cargando usuarios desde PostgreSQL...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2.5 pr-4">Nombre</th>
                    <th className="py-2.5 pr-4">Correo</th>
                    <th className="py-2.5 pr-4">Verificado</th>
                    <th className="py-2.5">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dbUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">
                        {u.email_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400">
                            <XCircle className="h-3.5 w-3.5" /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white"
                        >
                          <option value="cliente">Cliente</option>
                          <option value="desarrollador">Desarrollador</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* BIBLIOTECA DEL USUARIO (Para los 3 roles) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Mi Biblioteca de Programas ({ownedApps.length})
        </h2>
        {ownedApps.length === 0 ? (
          <p className="text-xs text-slate-400">
            Aún no has adquirido programas de paga. Explora el catálogo para comenzar.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ownedApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
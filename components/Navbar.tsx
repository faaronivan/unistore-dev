'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Package, PlusCircle, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, setIsAuthOpen, setIsUploadOpen, logout, notification } = useStore();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                UniStore <span className="text-indigo-400">Dev</span>
              </span>
              <p className="text-[11px] text-slate-400">Student & Indie App Hub</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (user ? setIsUploadOpen(true) : setIsAuthOpen(true))}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Publicar Programa</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {user.avatar}
                  </span>
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-200"
              >
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notificación Flotante (Toast) */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
          <span>{notification}</span>
        </div>
      )}
    </>
  );
}
'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUserSession, notify } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'cliente' | 'desarrollador'>('cliente');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, password, role } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error.');
        setLoading(false);
        return;
      }

      if (isRegister) {
        notify(data.message);
        setIsRegister(false);
        setPassword('');
      } else {
        setUserSession(data.user);
        setIsAuthOpen(false);
        notify(`¡Bienvenido, ${data.user.name} (${data.user.role})!`);
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-white">
          {isRegister ? 'Crear Cuenta en UniStore' : 'Iniciar Sesión'}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {isRegister
            ? 'Te enviaremos un correo para confirmar tu cuenta.'
            : 'Accede a tu panel según tu tipo de usuario.'}
        </p>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/50 p-2.5 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Tipo de cuenta</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'cliente' | 'desarrollador')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  <option value="cliente">Cliente (Comprar y descargar)</option>
                  <option value="desarrollador">Desarrollador (Publicar programas)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs text-slate-400">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegister ? 'Registrarme y Enviar Correo' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMsg('');
          }}
          className="mt-4 w-full text-center text-xs text-indigo-400 hover:underline"
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
        </button>
      </div>
    </div>
  );
}
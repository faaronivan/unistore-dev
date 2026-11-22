'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Category } from '@/types/app';
import { X } from 'lucide-react';

export default function UploadAppModal() {
  const { isUploadOpen, setIsUploadOpen, addApp, user } = useStore();
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState(user?.name || '');
const [category, setCategory] = useState<Exclude<Category, 'Todas'>>('Juegos');
  const [price, setPrice] = useState('0');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('C++, Next.js, SQL');

  if (!isUploadOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addApp({
      name,
      developer: developer || 'Compañero de Ingeniería',
      category,
      price: Number(price) || 0,
      version: '1.0.0',
      size: '35 MB',
      shortDesc,
      description,
      iconBg: 'from-indigo-600 to-cyan-600',
      iconName: 'Code2',
      tags: tags.split(',').map((t) => t.trim()),
      screenshots: [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
      ],
      requirements: {
        os: 'Windows 10/11 o Linux',
        processor: 'Intel Core i3 o superior',
        memory: '4 GB RAM',
        storage: '100 MB disponibles',
      },
      releaseNotes: 'v1.0.0: Lanzamiento inicial en UniStore Dev.',
    });
    setName('');
    setShortDesc('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={() => setIsUploadOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-white">Publicar Programa en la Tienda</h3>
        <p className="text-xs text-slate-400">
          Sube un proyecto tuyo o de tus compañeros para simular su venta o descarga.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Nombre del Programa</label>
              <input
                type="text"
                required
                placeholder="Ej. Inventario POS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Autor / Compañero</label>
              <input
                type="text"
                required
                placeholder="Nombre del creador"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<Category, 'Todas'>)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="Herramientas Dev">Herramientas Dev</option>
                <option value="Juegos">Juegos</option>
                <option value="Productividad">Productividad</option>
                <option value="Utilidades">Utilidades</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Precio (MXN, 0 = Gratis)</label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Resumen corto</label>
            <input
              type="text"
              required
              placeholder="Descripción breve para la tarjeta del catálogo"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Descripción completa</label>
            <textarea
              rows={3}
              required
              placeholder="Explica qué hace el programa, cómo se instaló o qué tecnologías usa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Tecnologías (separadas por coma)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
          >
            Publicar Ahora
          </button>
        </form>
      </div>
    </div>
  );
}
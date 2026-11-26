'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/mockData';
import { Category } from '@/types/app';
import AppCard from '@/components/AppCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const { apps } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todas');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'price'>('popular');

  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        const matchesCategory =
          selectedCategory === 'Todas' || app.category === selectedCategory;
        const query = search.toLowerCase();
        const matchesSearch =
          app.name.toLowerCase().includes(query) ||
          app.developer.toLowerCase().includes(query) ||
          app.tags.some((t) => t.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.downloads - a.downloads;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price') return a.price - b.price;
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      });
  }, [apps, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Explora, descarga y apoya el software de tus compañeros
          </h1>
          <p className="text-sm text-slate-300">
            Descubre, descarga y apoya aplicaciones creadas por otros estudiantes. Desde herramientas de productividad hasta juegos, encuentra software que se adapte a tus necesidades y gustos.
          </p>
        </div>
      </section>

      {/* Buscador y Controles de Filtro */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, autor o tecnología (ej. C++, Prisma, Juegos)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="popular">Más populares</option>
            <option value="rating">Mejor evaluadas</option>
            <option value="recent">Más recientes</option>
            <option value="price">Menor precio</option>
          </select>
        </div>
      </section>

      {/* Píldoras de Categorías */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Aplicaciones */}
      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <p className="text-sm text-slate-400">
            No se encontraron programas con esos filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
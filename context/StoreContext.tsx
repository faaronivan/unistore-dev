'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, Review, UserProfile } from '@/types/app';
import { INITIAL_APPS } from '@/data/mockData';

interface StoreContextType {
  apps: AppItem[];
  user: UserProfile | null;
  purchasedIds: string[];
  downloadingIds: Record<string, number>;
  notification: string | null;
  isAuthOpen: boolean;
  isUploadOpen: boolean;
  checkoutApp: AppItem | null;
  setIsAuthOpen: (open: boolean) => void;
  setIsUploadOpen: (open: boolean) => void;
  setCheckoutApp: (app: AppItem | null) => void;
  setUserSession: (loggedUser: UserProfile) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  addApp: (newApp: Omit<AppItem, 'id' | 'rating' | 'downloads' | 'reviews' | 'releaseDate'>) => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
  addReview: (appId: string, rating: number, comment: string) => Promise<void>;
  deleteReview: (appId: string, reviewId: string) => Promise<void>;
  completePurchase: (appId: string) => void;
  startDownload: (app: AppItem) => void;
  notify: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [purchasesByUser, setPurchasesByUser] = useState<Record<string, string[]>>({});
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [checkoutApp, setCheckoutAppState] = useState<AppItem | null>(null);

  useEffect(() => {
    const savedPurchasesByUser = localStorage.getItem('unistore_purchases_by_user');
    const savedUser = localStorage.getItem('unistore_current_user');
    if (savedPurchasesByUser) setPurchasesByUser(JSON.parse(savedPurchasesByUser));
    if (savedUser) setUser(JSON.parse(savedUser));

    const loadFromDatabase = async () => {
      try {
        const [appsRes, reviewsRes] = await Promise.all([
          fetch('/api/apps'),
          fetch('/api/reviews'),
        ]);

        const appsData = appsRes.ok ? await appsRes.json() : { apps: [] };
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };

        const dbApps: AppItem[] = appsData.apps || [];
        const dbReviews: (Review & { appId: string })[] = reviewsData.reviews || [];

        const combined = [...dbApps, ...INITIAL_APPS].map((app) => {
          const matchingDbReviews = dbReviews.filter((r) => r.appId === app.id);
          const allReviews = [...matchingDbReviews, ...app.reviews];
          const avg =
            allReviews.length > 0
              ? Number(
                  (
                    allReviews.reduce((acc, r) => acc + r.rating, 0) /
                    allReviews.length
                  ).toFixed(1)
                )
              : app.rating;

          return {
            ...app,
            reviews: allReviews,
            rating: avg,
          };
        });

        setApps(combined);
      } catch (err) {
        console.error('Error cargando datos de PostgreSQL:', err);
      }
    };

    loadFromDatabase();
  }, []);

  const purchasedIds = user ? purchasesByUser[user.email.toLowerCase()] || [] : [];

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const setUserSession = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    localStorage.setItem('unistore_current_user', JSON.stringify(loggedUser));
  };

  const setCheckoutApp = (app: AppItem | null) => {
    if (app && !user) {
      setIsAuthOpen(true);
      notify('Inicia sesión o regístrate para poder comprar este programa.');
      return;
    }
    setCheckoutAppState(app);
  };

  const login = (email: string, name = 'Usuario Universitario') => {
    const cleanEmail = email.trim().toLowerCase();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const loggedUser: UserProfile = {
      name,
      email: cleanEmail,
      role: 'cliente',
      avatar: initials || 'US',
    };

    setUserSession(loggedUser);
    setIsAuthOpen(false);
    notify(`¡Bienvenido, ${name}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unistore_current_user');
    notify('Sesión cerrada correctamente.');
  };

  const addApp = async (
    newAppData: Omit<AppItem, 'id' | 'rating' | 'downloads' | 'reviews' | 'releaseDate'>
  ) => {
    if (!user) {
      setIsAuthOpen(true);
      notify('Inicia sesión para publicar un programa.');
      return;
    }

    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAppData, ownerEmail: user.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'No se pudo publicar el programa.');
        return;
      }

      setApps((prev) => [data.app, ...prev]);
      setIsUploadOpen(false);
      notify(`¡"${data.app.name}" se guardó en PostgreSQL y ya es visible para todos!`);
    } catch {
      notify('Error de conexión al publicar el programa.');
    }
  };

  const deleteApp = async (appId: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/apps?id=${encodeURIComponent(appId)}&email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'No tienes permiso para eliminar este programa.');
        return;
      }
      setApps((prev) => prev.filter((a) => a.id !== appId));
      notify('Programa eliminado correctamente.');
    } catch {
      notify('Error al eliminar el programa.');
    }
  };

  const addReview = async (appId: string, rating: number, comment: string) => {
    if (!user) {
      setIsAuthOpen(true);
      notify('Inicia sesión para dejar un comentario.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          userName: user.name,
          userEmail: user.email,
          avatar: user.avatar,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'No se pudo publicar tu comentario.');
        return;
      }

      setApps((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;
          const updatedReviews = [data.review, ...app.reviews];
          const avg =
            updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
          return {
            ...app,
            reviews: updatedReviews,
            rating: Number(avg.toFixed(1)),
          };
        })
      );
      notify('¡Gracias! Tu reseña se guardó correctamente.');
    } catch {
      notify('Error de conexión al publicar la reseña.');
    }
  };

  const deleteReview = async (appId: string, reviewId: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/reviews?id=${encodeURIComponent(reviewId)}&email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'No tienes permiso para borrar este comentario.');
        return;
      }

      setApps((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;
          const updatedReviews = app.reviews.filter((r) => r.id !== reviewId);
          const avg =
            updatedReviews.length > 0
              ? Number(
                  (
                    updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
                    updatedReviews.length
                  ).toFixed(1)
                )
              : 5.0;
          return { ...app, reviews: updatedReviews, rating: avg };
        })
      );
      notify('Comentario eliminado.');
    } catch {
      notify('Error al eliminar el comentario.');
    }
  };

  const startDownload = (app: AppItem) => {
    if (downloadingIds[app.id] !== undefined) return;

    setDownloadingIds((prev) => ({ ...prev, [app.id]: 0 }));
    let progress = 0;

    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadingIds((prev) => {
          const copy = { ...prev };
          delete copy[app.id];
          return copy;
        });

        setApps((prevApps) =>
          prevApps.map((a) =>
            a.id === app.id ? { ...a, downloads: a.downloads + 1 } : a
          )
        );
        notify(`✅ Descarga completada: ${app.name} (v${app.version}). Instalador listo.`);
      } else {
        setDownloadingIds((prev) => ({ ...prev, [app.id]: progress }));
      }
    }, 350);
  };

  const completePurchase = (appId: string) => {
    if (!user) return;

    const emailKey = user.email.toLowerCase();
    const currentUserPurchases = purchasesByUser[emailKey] || [];
    const updatedUserPurchases = Array.from(new Set([...currentUserPurchases, appId]));

    const updatedAllPurchases = {
      ...purchasesByUser,
      [emailKey]: updatedUserPurchases,
    };

    setPurchasesByUser(updatedAllPurchases);
    localStorage.setItem('unistore_purchases_by_user', JSON.stringify(updatedAllPurchases));

    const boughtApp = apps.find((a) => a.id === appId);
    setCheckoutAppState(null);
    if (boughtApp) {
      notify(`🎉 Pago aprobado para "${boughtApp.name}". Iniciando descarga...`);
      startDownload(boughtApp);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        apps,
        user,
        purchasedIds,
        downloadingIds,
        notification,
        isAuthOpen,
        isUploadOpen,
        checkoutApp,
        setIsAuthOpen,
        setIsUploadOpen,
        setCheckoutApp,
        setUserSession,
        login,
        logout,
        addApp,
        deleteApp,
        addReview,
        deleteReview,
        completePurchase,
        startDownload,
        notify,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de StoreProvider');
  return context;
};
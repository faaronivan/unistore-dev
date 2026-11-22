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
  addApp: (newApp: Omit<AppItem, 'id' | 'rating' | 'downloads' | 'reviews' | 'releaseDate'>) => void;
  addReview: (appId: string, rating: number, comment: string) => void;
  completePurchase: (appId: string) => void;
  startDownload: (app: AppItem) => void;
  notify: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Compras guardadas por correo: { "correo@uni.mx": ["id1", "id2"] }
  const [purchasesByUser, setPurchasesByUser] = useState<Record<string, string[]>>({});

  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [checkoutApp, setCheckoutAppState] = useState<AppItem | null>(null);

  // Cargar datos guardados del navegador al iniciar
  useEffect(() => {
    const savedApps = localStorage.getItem('unistore_apps');
    const savedPurchasesByUser = localStorage.getItem('unistore_purchases_by_user');
    const savedUser = localStorage.getItem('unistore_current_user');

    if (savedApps) setApps(JSON.parse(savedApps));
    if (savedPurchasesByUser) setPurchasesByUser(JSON.parse(savedPurchasesByUser));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Lista de IDs comprados EXCLUSIVAMENTE por el usuario actual
  const purchasedIds = user ? purchasesByUser[user.email.toLowerCase()] || [] : [];

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Guarda la sesión real que viene desde PostgreSQL (/api/auth/login)
  const setUserSession = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    localStorage.setItem('unistore_current_user', JSON.stringify(loggedUser));
  };

  // Si intenta abrir el checkout sin cuenta, le pide iniciar sesión primero
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

  const addApp = (
    newAppData: Omit<AppItem, 'id' | 'rating' | 'downloads' | 'reviews' | 'releaseDate'>
  ) => {
    const newApp: AppItem = {
      ...newAppData,
      id: Date.now().toString(),
      rating: 5.0,
      downloads: 1,
      releaseDate: new Date().toISOString().split('T')[0],
      reviews: [],
    };
    const updated = [newApp, ...apps];
    setApps(updated);
    localStorage.setItem('unistore_apps', JSON.stringify(updated));
    setIsUploadOpen(false);
    notify(`¡"${newApp.name}" fue publicado con éxito en la tienda!`);
  };

  const addReview = (appId: string, rating: number, comment: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const newReview: Review = {
      id: Date.now().toString(),
      user: user.name,
      avatar: user.avatar,
      rating,
      date: 'Justo ahora',
      comment,
    };

    const updated = apps.map((app) => {
      if (app.id !== appId) return app;
      const updatedReviews = [newReview, ...app.reviews];
      const avg =
        updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
      return {
        ...app,
        reviews: updatedReviews,
        rating: Number(avg.toFixed(1)),
      };
    });

    setApps(updated);
    localStorage.setItem('unistore_apps', JSON.stringify(updated));
    notify('¡Gracias! Tu reseña ha sido publicada.');
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
        addReview,
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
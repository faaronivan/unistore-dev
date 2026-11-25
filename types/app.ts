export type Category =
  | 'Todas'
  | 'Juegos'
  | 'Deportes'
  | 'Seguridad'
  | 'Educación'
  | 'Estilo de Vida'
  | 'Entretenimiento';

export type UserRole = 'cliente' | 'desarrollador' | 'admin';

export type AppIconName =
  | 'Gamepad2'
  | 'Trophy'
  | 'ShieldAlert'
  | 'Bot'
  | 'Mic'
  | 'Utensils'
  | 'BookOpen'
  | 'Compass'
  | 'Code2';

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  userEmail?: string;
}

export interface SystemRequirements {
  os: string;
  processor: string;
  memory: string;
  storage: string;
}

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  category: Exclude<Category, 'Todas'>;
  price: number; // 0 = Gratis
  rating: number;
  downloads: number;
  version: string;
  releaseDate: string;
  size: string;
  shortDesc: string;
  description: string;
  iconBg: string;
  iconName: AppIconName;
  tags: string[];
  screenshots: string[];
  requirements: SystemRequirements;
  releaseNotes: string;
  reviews: Review[];
  ownerEmail?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  emailVerified?: boolean;
}
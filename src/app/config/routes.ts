// Powerful Routing Configuration with Dynamic Titles
export interface RouteConfig {
  path: string;
  title: {
    en: string;
    rw: string;
    fr: string;
    sw: string;
  };
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

export const routes: Record<string, RouteConfig> = {
  home: { path: 'home', title: { en: 'Home', rw: 'Ahabanza', fr: 'Accueil', sw: 'Nyumbani' }, icon: 'Home' },
  sports: { path: 'sports', title: { en: 'Sports', rw: 'Siporo', fr: 'Sports', sw: 'Michezo' }, icon: 'Trophy' },
  trades: { path: 'trades', title: { en: 'Trades', rw: 'Imyuga', fr: 'Métiers', sw: 'Biashara' }, icon: 'Wrench' },
  services: { path: 'services', title: { en: 'Services', rw: 'Serivisi', fr: 'Services', sw: 'Huduma' }, icon: 'Briefcase' },
  news: { path: 'news', title: { en: 'News', rw: 'Amakuru', fr: 'Actualités', sw: 'Habari' }, icon: 'Newspaper' },
  leadership: { path: 'leadership', title: { en: 'Leadership', rw: 'Ubuyobozi', fr: 'Direction', sw: 'Uongozi' }, icon: 'Shield' },
  developers: { path: 'developers', title: { en: 'Developers', rw: 'Abatunganyije', fr: 'Développeurs', sw: 'Waendelezaji' }, icon: 'Code' },
  contactUs: { path: 'contactUs', title: { en: 'Contact Us', rw: 'Twandikire', fr: 'Contactez-nous', sw: 'Wasiliana Nasi' }, icon: 'Phone' },
  supports: { path: 'supports', title: { en: 'Support', rw: 'Ubufasha', fr: 'Support', sw: 'Msaada' }, icon: 'HelpCircle' },
  login: { path: 'login', title: { en: 'Login', rw: 'Injira', fr: 'Connexion', sw: 'Ingia' }, icon: 'LogIn' },
  register: { path: 'register', title: { en: 'Register', rw: 'Iyandikishe', fr: 'S\'inscrire', sw: 'Jisajili' }, icon: 'UserPlus' },
  'dashboard-admin': { path: 'admin', title: { en: 'Admin Dashboard', rw: 'Ibikubiyemo by\'Umuyobozi', fr: 'Tableau de bord Admin', sw: 'Dashibodi ya Msimamizi' }, icon: 'LayoutDashboard', requiresAuth: true, roles: ['admin', 'super_admin'] },
  'dashboard-student': { path: 'dashboard-student', title: { en: 'Student Dashboard', rw: 'Ibikubiyemo by\'Umunyeshuri', fr: 'Tableau de bord Étudiant', sw: 'Dashibodi ya Mwanafunzi' }, icon: 'GraduationCap', requiresAuth: true, roles: ['student'] },
  'dashboard-parent': { path: 'dashboard-parent', title: { en: 'Parent Dashboard', rw: 'Ibikubiyemo by\'Umubyeyi', fr: 'Tableau de bord Parent', sw: 'Dashibodi ya Mzazi' }, icon: 'Users', requiresAuth: true, roles: ['parent'] },
  'dashboard-teacher': { path: 'dashboard-teacher', title: { en: 'Teacher Dashboard', rw: 'Ibikubiyemo by\'Umwarimu', fr: 'Tableau de bord Enseignant', sw: 'Dashibodi ya Mwalimu' }, icon: 'BookOpen', requiresAuth: true, roles: ['teacher'] },
  'dashboard-director-study': { path: 'dashboard-director-study', title: { en: 'Director of Studies', rw: 'Umuyobozi w\'Amasomo', fr: 'Directeur des Études', sw: 'Mkurugenzi wa Masomo' }, icon: 'BookCheck', requiresAuth: true, roles: ['director_study'] },
  'dashboard-director-discipline': { path: 'dashboard-director-discipline', title: { en: 'Director of Discipline', rw: 'Umuyobozi w\'Indero', fr: 'Directeur de Discipline', sw: 'Mkurugenzi wa Nidhamu' }, icon: 'ShieldAlert', requiresAuth: true, roles: ['director_discipline'] },
  'dashboard-headmaster': { path: 'dashboard-headmaster', title: { en: 'Headmaster Dashboard', rw: 'Ibikubiyemo by\'Umuyobozi Mukuru', fr: 'Tableau de bord Directeur', sw: 'Dashibodi ya Mwalimu Mkuu' }, icon: 'Crown', requiresAuth: true, roles: ['headmaster'] },
  'dashboard-accountant': { path: 'dashboard-accountant', title: { en: 'Accountant Dashboard', rw: 'Ibikubiyemo by\'Umubare', fr: 'Tableau de bord Comptable', sw: 'Dashibodi ya Mhasibu' }, icon: 'Calculator', requiresAuth: true, roles: ['accountant'] },
  'dashboard-stock': { path: 'dashboard-stock', title: { en: 'Stock Manager', rw: 'Umuyobozi w\'Ibicuruzwa', fr: 'Gestionnaire de Stock', sw: 'Meneja wa Hisa' }, icon: 'Package', requiresAuth: true, roles: ['stock_manager'] },
  'students-management': { path: 'students-management', title: { en: 'Students Management', rw: 'Gucunga Abanyeshuri', fr: 'Gestion des Étudiants', sw: 'Usimamizi wa Wanafunzi' }, icon: 'Users', requiresAuth: true },
  'payments-management': { path: 'payments-management', title: { en: 'Payments Management', rw: 'Gucunga Amafaranga', fr: 'Gestion des Paiements', sw: 'Usimamizi wa Malipo' }, icon: 'CreditCard', requiresAuth: true },
  'medical-system': { path: 'medical-system', title: { en: 'Medical System', rw: 'Sisitemu y\'Ubuvuzi', fr: 'Système Médical', sw: 'Mfumo wa Tiba' }, icon: 'Heart', requiresAuth: true },
  'library-system': { path: 'library-system', title: { en: 'Library System', rw: 'Sisitemu y\'Isomero', fr: 'Système de Bibliothèque', sw: 'Mfumo wa Maktaba' }, icon: 'Library', requiresAuth: true },
  search: { path: 'search', title: { en: 'Search', rw: 'Shakisha', fr: 'Rechercher', sw: 'Tafuta' }, icon: 'Search' },
};

export const getRouteTitle = (path: string, language: 'en' | 'rw' | 'fr' | 'sw' = 'en'): string => {
  if (path.includes('/')) {
    const basePath = path.split('/')[0];
    const dynamicRoutes: Record<string, RouteConfig> = {
      article: { path: 'article', title: { en: 'Article', rw: 'Inkuru', fr: 'Article', sw: 'Makala' } },
      trade: { path: 'trade', title: { en: 'Trade Details', rw: 'Ibisobanuro by\'Umwuga', fr: 'Détails du Métier', sw: 'Maelezo ya Biashara' } },
      'sport-team': { path: 'sport-team', title: { en: 'Team Details', rw: 'Ibisobanuro by\'Ikipe', fr: 'Détails de l\'Équipe', sw: 'Maelezo ya Timu' } },
      news: { path: 'news', title: { en: 'News Article', rw: 'Inkuru', fr: 'Article d\'Actualité', sw: 'Makala ya Habari' } },
      developer: { path: 'developer', title: { en: 'Developer Profile', rw: 'Umwirondoro w\'Umutunganyije', fr: 'Profil du Développeur', sw: 'Wasifu wa Msanidi' } },
      leader: { path: 'leader', title: { en: 'Leader Profile', rw: 'Umwirondoro w\'Umuyobozi', fr: 'Profil du Leader', sw: 'Wasifu wa Kiongozi' } },
    };
    if (dynamicRoutes[basePath]) return dynamicRoutes[basePath].title[language];
  }
  const route = routes[path];
  return route ? route.title[language] : path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
};

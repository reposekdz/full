import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'fr' | 'rw' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Extended translations with comprehensive Kinyarwanda support
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: 'HOME',
    sports: 'SPORTS',
    services: 'SERVICES',
    trades: 'TRADES',
    contactUs: 'CONTACT US',
    supports: 'SUPPORTS',
    login: 'LOGIN',
    register: 'REGISTER',
    // Hero
    heroTitle: 'EMPOWERING FUTURE SKILLS',
    heroSubtitle: 'Building Tomorrow\'s Professionals Today',
    // Trades
    tradesOffered: 'TRADES OFFERED',
    softwareDevelopment: 'Software Development',
    buildingConstruction: 'Building Construction',
    automobileTechnology: 'Automobile Technology',
    sod: 'SOD',
    bdc: 'BDC',
    // Portal
    upcomingEvents: 'UPCOMING EVENTS',
    studentParentPortal: 'STUDENT & PARENT PORTAL',
    studentPortal: 'Student Portal',
    studentAndParent: 'Student & Parent',
    // Footer
    quickLinks: 'QUICK LINKS',
    contactInfo: 'CONTACT INFO',
    newsletter: 'NEWSLETTER',
    // Forms
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    enterStaffCode: 'ENTER STAFF CODE',
    cancel: 'CANCEL',
    submit: 'Submit',
    // Search
    searchPlaceholder: 'Search everything...',
    // More
    learnMore: 'Learn More',
    viewAll: 'View All',
    getStarted: 'Get Started',
    // Dashboard terms
    dashboard: 'Dashboard',
    overview: 'Overview',
    analytics: 'Analytics',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    notifications: 'Notifications',
    logout: 'Logout',
    // Academic terms
    courses: 'Courses',
    grades: 'Grades',
    attendance: 'Attendance',
    assignments: 'Assignments',
    exams: 'Exams',
    schedule: 'Schedule',
    // Advanced features
    artificialIntelligence: 'Artificial Intelligence',
    blockchain: 'Blockchain',
    iot: 'Internet of Things',
    biometric: 'Biometric',
    augmentedReality: 'Augmented Reality',
    predictiveAnalytics: 'Predictive Analytics',
    smartEnergy: 'Smart Energy',
    quantumSecurity: 'Quantum Security',
    // System messages
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
  },
  fr: {
    home: 'ACCUEIL',
    sports: 'SPORTS',
    services: 'SERVICES',
    trades: 'MÉTIERS',
    contactUs: 'CONTACTEZ-NOUS',
    supports: 'SUPPORTS',
    login: 'CONNEXION',
    register: 'S\'INSCRIRE',
    heroTitle: 'DÉVELOPPEMENT LOGICIEL',
    heroSubtitle: 'Former les Professionnels de Demain Aujourd\'hui',
    tradesOffered: 'MÉTIERS OFFERTS',
    softwareDevelopment: 'Développement Logiciel',
    buildingConstruction: 'Construction de Bâtiments',
    automobileTechnology: 'Technologie Automobile',
    sod: 'SOD',
    bdc: 'BDC',
    upcomingEvents: 'ÉVÉNEMENTS À VENIR',
    studentParentPortal: 'PORTAIL ÉTUDIANTS ET PARENTS',
    studentPortal: 'Portail Étudiant',
    studentAndParent: 'Étudiant et Parent',
    quickLinks: 'LIENS RAPIDES',
    contactInfo: 'INFORMATIONS DE CONTACT',
    newsletter: 'NEWSLETTER',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    phoneNumber: 'Numéro de téléphone',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    enterStaffCode: 'ENTRER LE CODE DU PERSONNEL',
    cancel: 'ANNULER',
    submit: 'Soumettre',
    searchPlaceholder: 'Rechercher tout...',
    learnMore: 'En savoir plus',
    viewAll: 'Voir tout',
    getStarted: 'Commencer',
    // Dashboard terms
    dashboard: 'Tableau de bord',
    overview: 'Vue d\'ensemble',
    analytics: 'Analytiques',
    reports: 'Rapports',
    settings: 'Paramètres',
    profile: 'Profil',
    notifications: 'Notifications',
    logout: 'Déconnexion',
    // Academic terms
    courses: 'Cours',
    grades: 'Notes',
    attendance: 'Présence',
    assignments: 'Devoirs',
    exams: 'Examens',
    schedule: 'Horaire',
    // Advanced features
    artificialIntelligence: 'Intelligence Artificielle',
    blockchain: 'Blockchain',
    iot: 'Internet des Objets',
    biometric: 'Biométrique',
    augmentedReality: 'Réalité Augmentée',
    predictiveAnalytics: 'Analytiques Prédictives',
    smartEnergy: 'Énergie Intelligente',
    quantumSecurity: 'Sécurité Quantique',
    // System messages
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Attention',
    info: 'Information',
  },
  rw: {
    home: 'AHABANZA',
    sports: 'SIPORO',
    services: 'SERIVISI',
    trades: 'AMAHUGURWA',
    contactUs: 'TWANDIKIRE',
    supports: 'UBUFASHA',
    login: 'KWINJIRA',
    register: 'IYANDIKISHE',
    heroTitle: 'GUTEZA IMBERE UBUMENYI',
    heroSubtitle: 'Twubaka Abahanga b\'Ejo Uyu Munsi',
    tradesOffered: 'AMAHUGURWA ATANGWA',
    softwareDevelopment: 'Iterambere rya Porogaramu',
    buildingConstruction: 'Ubwubatsi',
    automobileTechnology: 'Ikoranabuhanga ry\'Imodoka',
    sod: 'SOD',
    bdc: 'BDC',
    upcomingEvents: 'IBIRORI BIZAZA',
    studentParentPortal: 'URUBUGA RW\'ABANYESHURI N\'ABABYEYI',
    studentPortal: 'Urubuga rw\'Abanyeshuri',
    studentAndParent: 'Umunyeshuri & Umubyeyi',
    quickLinks: 'AMAHUZA YIHUSE',
    contactInfo: 'AMAKURU Y\'ITUMANAHO',
    newsletter: 'INKURU',
    email: 'Aderesi ya imeyili',
    password: 'Ijambo ry\'ibanga',
    confirmPassword: 'Emeza ijambo ry\'ibanga',
    fullName: 'Amazina yose',
    phoneNumber: 'Nimero ya terefone',
    signIn: 'Injira',
    signUp: 'Iyandikishe',
    enterStaffCode: 'INJIZA KODE Y\'ABAKOZI',
    cancel: 'HAGARIKA',
    submit: 'Ohereza',
    searchPlaceholder: 'Shakisha byose...',
    learnMore: 'Menya byinshi',
    viewAll: 'Reba byose',
    getStarted: 'Tangira',
    // Dashboard terms
    dashboard: 'Ikimenyetso',
    overview: 'Icyerekezo rusange',
    analytics: 'Isesengura',
    reports: 'Raporo',
    settings: 'Igenamigambi',
    profile: 'Umwirondoro',
    notifications: 'Ubutumwa',
    logout: 'Gusohoka',
    // Academic terms
    courses: 'Amasomo',
    grades: 'Amanota',
    attendance: 'Kwitabira',
    assignments: 'Akazi k\'umuryango',
    exams: 'Ibizamini',
    schedule: 'Gahunda',
    // Advanced features
    artificialIntelligence: 'Ubwiyunge Bwubatswe',
    blockchain: 'Tekinoroji ya Blockchain',
    iot: 'Ibibanza bya Internet',
    biometric: 'Ibimenyetso by\'umuntu',
    augmentedReality: 'Ukuri Kwongerewe',
    predictiveAnalytics: 'Isesengura Riteganya',
    smartEnergy: 'Ingufu Zirangwa Ubwiyunge',
    quantumSecurity: 'Umutekano wa Quantum',
    // System messages
    loading: 'Birategurika...',
    error: 'Ikosa',
    success: 'Byagenze neza',
    warning: 'Iburira',
    info: 'Amakuru',
  },
  sw: {
    home: 'NYUMBANI',
    sports: 'MICHEZO',
    services: 'HUDUMA',
    trades: 'BIASHARA',
    contactUs: 'WASILIANA NASI',
    supports: 'MSAADA',
    login: 'INGIA',
    register: 'SAJILI',
    heroTitle: 'TEKNOLOJIA YA MAGARI',
    heroSubtitle: 'Kujenga Wataalamu wa Kesho Leo',
    tradesOffered: 'BIASHARA ZINAZOTOLEWA',
    softwareDevelopment: 'Utengenezaji wa Programu',
    buildingConstruction: 'Ujenzi wa Majengo',
    automobileTechnology: 'Teknolojia ya Magari',
    sod: 'SOD',
    bdc: 'BDC',
    upcomingEvents: 'MATUKIO YANAYOKUJA',
    studentParentPortal: 'LANGO LA WANAFUNZI NA WAZAZI',
    studentPortal: 'Lango la Wanafunzi',
    studentAndParent: 'Mwanafunzi & Mzazi',
    quickLinks: 'VIUNGO VYA HARAKA',
    contactInfo: 'MAELEZO YA MAWASILIANO',
    newsletter: 'JARIDA',
    email: 'Anwani ya barua pepe',
    password: 'Neno la siri',
    confirmPassword: 'Thibitisha neno la siri',
    fullName: 'Jina kamili',
    phoneNumber: 'Nambari ya simu',
    signIn: 'Ingia',
    signUp: 'Jisajili',
    enterStaffCode: 'WEKA MSIMBO WA WAFANYAKAZI',
    cancel: 'GHAIRI',
    submit: 'Wasilisha',
    searchPlaceholder: 'Tafuta kila kitu...',
    learnMore: 'Jifunze zaidi',
    viewAll: 'Tazama zote',
    getStarted: 'Anza',
    // Dashboard terms
    dashboard: 'Dashibodi',
    overview: 'Muhtasari',
    analytics: 'Uchanganuzi',
    reports: 'Ripoti',
    settings: 'Mipangilio',
    profile: 'Wasifu',
    notifications: 'Arifa',
    logout: 'Ondoka',
    // Academic terms
    courses: 'Kozi',
    grades: 'Alama',
    attendance: 'Mahudhurio',
    assignments: 'Kazi',
    exams: 'Mtihani',
    schedule: 'Ratiba',
    // Advanced features
    artificialIntelligence: 'Akili Bandia',
    blockchain: 'Blockchain',
    iot: 'Intaneti ya Vitu',
    biometric: 'Kibayometriki',
    augmentedReality: 'Uhalisia Ulioongezwa',
    predictiveAnalytics: 'Uchambuzi wa Kutabiri',
    smartEnergy: 'Nishati Mahiri',
    quantumSecurity: 'Usalama wa Quantum',
    // System messages
    loading: 'Inapakia...',
    error: 'Kosa',
    success: 'Mafanikio',
    warning: 'Onyo',
    info: 'Maelezo',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('rw');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a default context instead of throwing error
    return {
      language: 'rw' as Language,
      setLanguage: () => {},
      t: (key: string) => key
    };
  }
  return context;
};

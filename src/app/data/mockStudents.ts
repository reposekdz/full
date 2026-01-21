import { Student, TradeInfo } from '@/app/types/student';

export const mockStudents: Student[] = [
  {
    id: '1',
    studentCode: 'SOD-L3-001',
    name: 'Jean Mugisha',
    email: 'jean.mugisha@student.com',
    dateOfBirth: '2005-03-15',
    gender: 'Male',
    trade: 'SOD',
    level: 'Level 3 SOD',
    enrollmentDate: '2023-09-01',
    status: 'active',
    parent: {
      id: 'p1',
      name: 'Pierre Mugisha',
      phoneNumber: '+250788123456',
      email: 'pierre.mugisha@gmail.com',
      relationship: 'Father'
    },
    grades: [
      { subject: 'Software Development', score: 85, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Dr. Uwase', remarks: 'Excellent work' },
      { subject: 'Database Management', score: 78, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Mr. Nkusi' },
      { subject: 'Web Development', score: 92, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Ms. Umutoni' }
    ],
    conducts: [
      { id: 'c1', type: 'positive', title: 'Best Project Award', description: 'Created outstanding web application', date: '2024-01-10', reportedBy: 'Dr. Uwase', status: 'resolved' }
    ],
    attendance: [
      { date: '2024-01-20', status: 'present' },
      { date: '2024-01-19', status: 'present' }
    ],
    overallAverage: 85,
    attendanceRate: 95,
    behaviorScore: 98
  },
  {
    id: '2',
    studentCode: 'SOD-L4-015',
    name: 'Marie Uwase',
    email: 'marie.uwase@student.com',
    dateOfBirth: '2004-07-22',
    gender: 'Female',
    trade: 'SOD',
    level: 'Level 4 SOD',
    enrollmentDate: '2022-09-01',
    status: 'active',
    parent: {
      id: 'p2',
      name: 'Grace Uwase',
      phoneNumber: '+250788234567',
      relationship: 'Mother'
    },
    grades: [
      { subject: 'Advanced Programming', score: 88, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Dr. Uwase' },
      { subject: 'System Analysis', score: 82, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Mr. Habimana' }
    ],
    conducts: [],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 85,
    attendanceRate: 97,
    behaviorScore: 95
  },
  {
    id: '3',
    studentCode: 'BDC-L3-008',
    name: 'Patrick Nkusi',
    email: 'patrick.nkusi@student.com',
    dateOfBirth: '2005-11-08',
    gender: 'Male',
    trade: 'BDC',
    level: 'Level 3 BDC',
    enrollmentDate: '2023-09-01',
    status: 'active',
    parent: {
      id: 'p3',
      name: 'Emmanuel Nkusi',
      phoneNumber: '+250788345678',
      relationship: 'Father'
    },
    grades: [
      { subject: 'Construction Basics', score: 75, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Mr. Kayitare' },
      { subject: 'Technical Drawing', score: 80, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Ms. Mukamana' }
    ],
    conducts: [],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 77.5,
    attendanceRate: 92,
    behaviorScore: 90
  },
  {
    id: '4',
    studentCode: 'BDC-L5-025',
    name: 'Alice Umutoni',
    email: 'alice.umutoni@student.com',
    dateOfBirth: '2003-02-14',
    gender: 'Female',
    trade: 'BDC',
    level: 'Level 5 BDC',
    enrollmentDate: '2021-09-01',
    status: 'active',
    parent: {
      id: 'p4',
      name: 'Sarah Umutoni',
      phoneNumber: '+250788456789',
      relationship: 'Mother'
    },
    grades: [
      { subject: 'Advanced Construction', score: 90, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Mr. Kayitare' },
      { subject: 'Project Management', score: 87, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Dr. Mukeshimana' }
    ],
    conducts: [
      { id: 'c2', type: 'positive', title: 'Leadership Excellence', description: 'Led successful construction project', date: '2024-01-15', reportedBy: 'Mr. Kayitare', status: 'resolved' }
    ],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 88.5,
    attendanceRate: 98,
    behaviorScore: 96
  },
  {
    id: '5',
    studentCode: 'AUT-L3-012',
    name: 'Eric Habimana',
    email: 'eric.habimana@student.com',
    dateOfBirth: '2005-05-30',
    gender: 'Male',
    trade: 'AUT',
    level: 'Level 3 AUT',
    enrollmentDate: '2023-09-01',
    status: 'active',
    parent: {
      id: 'p5',
      name: 'David Habimana',
      phoneNumber: '+250788567890',
      relationship: 'Father'
    },
    grades: [
      { subject: 'Auto Mechanics Basics', score: 82, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Mr. Ntare' },
      { subject: 'Engine Systems', score: 78, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Mr. Gasana' }
    ],
    conducts: [],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 80,
    attendanceRate: 94,
    behaviorScore: 92
  },
  {
    id: '6',
    studentCode: 'AUT-L4A-020',
    name: 'Grace Mutesi',
    email: 'grace.mutesi@student.com',
    dateOfBirth: '2004-09-12',
    gender: 'Female',
    trade: 'AUT',
    level: 'Level 4A AUT',
    enrollmentDate: '2022-09-01',
    status: 'active',
    parent: {
      id: 'p6',
      name: 'Rose Mutesi',
      phoneNumber: '+250788678901',
      relationship: 'Mother'
    },
    grades: [
      { subject: 'Advanced Diagnostics', score: 86, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Mr. Ntare' },
      { subject: 'Electrical Systems', score: 84, maxScore: 100, grade: 'B', term: 'Term 1', year: '2024', teacher: 'Ms. Nyiransabimana' }
    ],
    conducts: [],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 85,
    attendanceRate: 96,
    behaviorScore: 94
  },
  {
    id: '7',
    studentCode: 'AUT-L5B-030',
    name: 'Samuel Uwimana',
    email: 'samuel.uwimana@student.com',
    dateOfBirth: '2003-12-05',
    gender: 'Male',
    trade: 'AUT',
    level: 'Level 5B AUT',
    enrollmentDate: '2021-09-01',
    status: 'active',
    parent: {
      id: 'p7',
      name: 'Jean Uwimana',
      phoneNumber: '+250788789012',
      relationship: 'Father'
    },
    grades: [
      { subject: 'Master Technician Skills', score: 92, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Mr. Gasana' },
      { subject: 'Business Management', score: 88, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Ms. Mukarugwiza' }
    ],
    conducts: [
      { id: 'c3', type: 'positive', title: 'Innovation Award', description: 'Developed new diagnostic tool', date: '2024-01-12', reportedBy: 'Mr. Gasana', status: 'resolved' }
    ],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 90,
    attendanceRate: 99,
    behaviorScore: 97
  },
  {
    id: '8',
    studentCode: 'SOD-L5-040',
    name: 'Divine Ishimwe',
    email: 'divine.ishimwe@student.com',
    dateOfBirth: '2003-04-18',
    gender: 'Female',
    trade: 'SOD',
    level: 'Level 5 SOD',
    enrollmentDate: '2021-09-01',
    status: 'active',
    parent: {
      id: 'p8',
      name: 'Christine Ishimwe',
      phoneNumber: '+250788890123',
      relationship: 'Mother'
    },
    grades: [
      { subject: 'Full Stack Development', score: 95, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Dr. Uwase' },
      { subject: 'Cloud Computing', score: 91, maxScore: 100, grade: 'A', term: 'Term 1', year: '2024', teacher: 'Mr. Nshimiyimana' }
    ],
    conducts: [
      { id: 'c4', type: 'positive', title: 'Top Student', description: 'Highest grades in software development', date: '2024-01-18', reportedBy: 'Dr. Uwase', status: 'resolved' }
    ],
    attendance: [
      { date: '2024-01-20', status: 'present' }
    ],
    overallAverage: 93,
    attendanceRate: 100,
    behaviorScore: 99
  }
];

export const tradesInfo: TradeInfo[] = [
  {
    name: 'SOD',
    fullName: 'Software Development',
    description: 'Learn programming, web development, and software engineering',
    levels: ['Level 3 SOD', 'Level 4 SOD', 'Level 5 SOD'],
    tools: [
      { id: 't1', name: 'Dell Laptops', description: 'High-performance laptops for development', quantity: 45, condition: 'excellent', lastMaintenance: '2024-01-10' },
      { id: 't2', name: 'Development Servers', description: 'Cloud servers for student projects', quantity: 5, condition: 'good', lastMaintenance: '2024-01-05' },
      { id: 't3', name: 'Network Equipment', description: 'Routers and switches for networking labs', quantity: 12, condition: 'good' }
    ],
    gallery: [
      { id: 'g1', title: 'Coding Workshop 2024', description: 'Students learning React', imageUrl: '/images/sod-workshop1.jpg', category: 'workshop', date: '2024-01-15' },
      { id: 'g2', title: 'Student Projects Showcase', description: 'Final year projects presentation', imageUrl: '/images/sod-projects.jpg', category: 'projects', date: '2024-01-10' }
    ],
    features: ['Modern Computer Labs', '24/7 Internet Access', 'Industry Partnerships', 'Internship Programs']
  },
  {
    name: 'BDC',
    fullName: 'Building and Construction',
    description: 'Master construction techniques, project management, and building design',
    levels: ['Level 3 BDC', 'Level 4 BDC', 'Level 5 BDC'],
    tools: [
      { id: 't4', name: 'Power Tools Set', description: 'Complete set of electric power tools', quantity: 30, condition: 'good', lastMaintenance: '2024-01-12' },
      { id: 't5', name: 'Surveying Equipment', description: 'Total stations and theodolites', quantity: 8, condition: 'excellent', lastMaintenance: '2024-01-08' },
      { id: 't6', name: 'Safety Gear', description: 'Hard hats, safety boots, gloves', quantity: 100, condition: 'good' }
    ],
    gallery: [
      { id: 'g3', title: 'Construction Site Visit', description: 'Students at real construction site', imageUrl: '/images/bdc-site.jpg', category: 'events', date: '2024-01-14' },
      { id: 'g4', title: 'Model Building Competition', description: 'Annual building competition', imageUrl: '/images/bdc-competition.jpg', category: 'achievements', date: '2024-01-08' }
    ],
    features: ['Modern Workshop', 'Construction Site Access', 'CAD Software Training', 'Professional Certification']
  },
  {
    name: 'AUT',
    fullName: 'Automobile Technology',
    description: 'Learn automotive repair, diagnostics, and vehicle maintenance',
    levels: ['Level 3 AUT', 'Level 4A AUT', 'Level 4B AUT', 'Level 5A AUT', 'Level 5B AUT'],
    tools: [
      { id: 't7', name: 'Diagnostic Scanners', description: 'Professional OBD-II scanners', quantity: 15, condition: 'excellent', lastMaintenance: '2024-01-15' },
      { id: 't8', name: 'Engine Hoists', description: 'Hydraulic engine lifting equipment', quantity: 6, condition: 'good', lastMaintenance: '2024-01-10' },
      { id: 't9', name: 'Tool Sets', description: 'Complete mechanic tool sets', quantity: 40, condition: 'good' },
      { id: 't10', name: 'Practice Vehicles', description: 'Various car models for training', quantity: 12, condition: 'fair' }
    ],
    gallery: [
      { id: 'g5', title: 'Auto Workshop', description: 'Students working on engines', imageUrl: '/images/aut-workshop.jpg', category: 'workshop', date: '2024-01-16' },
      { id: 'g6', title: 'Skills Competition Winner', description: 'National auto competition champions', imageUrl: '/images/aut-award.jpg', category: 'achievements', date: '2024-01-05' }
    ],
    features: ['Fully Equipped Auto Shop', 'Latest Diagnostic Tools', 'Industry Partnerships', 'Certification Programs']
  }
];

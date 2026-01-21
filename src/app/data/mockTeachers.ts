export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  trade: 'SOD' | 'BDC' | 'AUT';
  qualification: string;
  experience: number;
  photoUrl: string;
  bio: string;
  rating: number;
  studentsCount: number;
  coursesTeaching: string[];
}

export const mockTeachers: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Alice Uwase',
    email: 'alice.uwase@gardentvet.edu',
    phone: '+250788901234',
    specialization: 'Software Development',
    trade: 'SOD',
    qualification: 'PhD in Computer Science',
    experience: 12,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Expert in software engineering with extensive experience in web development and mobile applications.',
    rating: 4.8,
    studentsCount: 85,
    coursesTeaching: ['Advanced Programming', 'Web Development', 'Database Management']
  },
  {
    id: 't2',
    name: 'Mr. Jean Baptiste Nkusi',
    email: 'jean.nkusi@gardentvet.edu',
    phone: '+250788902345',
    specialization: 'Mobile Development',
    trade: 'SOD',
    qualification: 'MSc in Software Engineering',
    experience: 8,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Specialized in Android and iOS development with industry certifications from Google and Apple.',
    rating: 4.7,
    studentsCount: 72,
    coursesTeaching: ['Mobile App Development', 'UI/UX Design', 'Agile Methodologies']
  },
  {
    id: 't3',
    name: 'Ms. Grace Mukamana',
    email: 'grace.mukamana@gardentvet.edu',
    phone: '+250788903456',
    specialization: 'Data Science & AI',
    trade: 'SOD',
    qualification: 'MSc in Artificial Intelligence',
    experience: 6,
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    bio: 'Passionate about teaching machine learning and data analytics to the next generation of developers.',
    rating: 4.9,
    studentsCount: 65,
    coursesTeaching: ['Python Programming', 'Machine Learning', 'Data Structures']
  },
  {
    id: 't4',
    name: 'Eng. Patrick Habimana',
    email: 'patrick.habimana@gardentvet.edu',
    phone: '+250788904567',
    specialization: 'Construction Engineering',
    trade: 'BDC',
    qualification: 'BSc in Civil Engineering',
    experience: 15,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Seasoned construction engineer with multiple high-rise projects under supervision.',
    rating: 4.8,
    studentsCount: 92,
    coursesTeaching: ['Structural Engineering', 'Construction Management', 'Building Materials']
  },
  {
    id: 't5',
    name: 'Mr. Emmanuel Kayitare',
    email: 'emmanuel.kayitare@gardentvet.edu',
    phone: '+250788905678',
    specialization: 'Architectural Design',
    trade: 'BDC',
    qualification: 'MSc in Architecture',
    experience: 10,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bio: 'Award-winning architect with expertise in sustainable building design and urban planning.',
    rating: 4.9,
    studentsCount: 78,
    coursesTeaching: ['Technical Drawing', 'AutoCAD', 'Sustainable Architecture']
  },
  {
    id: 't6',
    name: 'Ms. Sarah Umutoni',
    email: 'sarah.umutoni@gardentvet.edu',
    phone: '+250788906789',
    specialization: 'Quantity Surveying',
    trade: 'BDC',
    qualification: 'BSc in Quantity Surveying',
    experience: 7,
    photoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
    bio: 'Expert in cost estimation and project budgeting for construction projects.',
    rating: 4.7,
    studentsCount: 68,
    coursesTeaching: ['Cost Estimation', 'Project Planning', 'Construction Economics']
  },
  {
    id: 't7',
    name: 'Eng. David Mugabo',
    email: 'david.mugabo@gardentvet.edu',
    phone: '+250788907890',
    specialization: 'Automotive Engineering',
    trade: 'AUT',
    qualification: 'MSc in Automotive Engineering',
    experience: 14,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    bio: 'Veteran automotive engineer with certifications from major car manufacturers.',
    rating: 4.9,
    studentsCount: 95,
    coursesTeaching: ['Engine Systems', 'Vehicle Diagnostics', 'Auto Electronics']
  },
  {
    id: 't8',
    name: 'Mr. Frank Niyonzima',
    email: 'frank.niyonzima@gardentvet.edu',
    phone: '+250788908901',
    specialization: 'Auto Mechanics',
    trade: 'AUT',
    qualification: 'BSc in Mechanical Engineering',
    experience: 11,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    bio: 'Hands-on expert in vehicle repair and maintenance with industry experience.',
    rating: 4.8,
    studentsCount: 88,
    coursesTeaching: ['Auto Repair', 'Transmission Systems', 'Brake Systems']
  },
  {
    id: 't9',
    name: 'Ms. Claire Uwera',
    email: 'claire.uwera@gardentvet.edu',
    phone: '+250788909012',
    specialization: 'Electric Vehicles',
    trade: 'AUT',
    qualification: 'MSc in Electric Vehicle Technology',
    experience: 5,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    bio: 'Specialist in modern electric and hybrid vehicle technology and charging systems.',
    rating: 4.9,
    studentsCount: 62,
    coursesTeaching: ['EV Technology', 'Battery Systems', 'Modern Auto Electronics']
  }
];

export const getTeachersByTrade = (trade: 'SOD' | 'BDC' | 'AUT'): Teacher[] => {
  return mockTeachers.filter(teacher => teacher.trade === trade);
};

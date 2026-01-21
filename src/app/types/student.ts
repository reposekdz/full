export type Trade = 'SOD' | 'BDC' | 'AUT';

export type SODLevel = 'Level 3 SOD' | 'Level 4 SOD' | 'Level 5 SOD';
export type BDCLevel = 'Level 3 BDC' | 'Level 4 BDC' | 'Level 5 BDC';
export type AUTLevel = 'Level 3 AUT' | 'Level 4A AUT' | 'Level 4B AUT' | 'Level 5A AUT' | 'Level 5B AUT';

export type TradeLevel = SODLevel | BDCLevel | AUTLevel;

export interface Parent {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
}

export interface Grade {
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  term: string;
  year: string;
  teacher: string;
  remarks?: string;
}

export interface Conduct {
  id: string;
  type: 'positive' | 'negative';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  date: string;
  reportedBy: string;
  action?: string;
  status: 'pending' | 'resolved' | 'escalated';
}

export interface Attendance {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
  remarks?: string;
}

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  trade: Trade;
  level: TradeLevel;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  parent?: Parent;
  grades: Grade[];
  conducts: Conduct[];
  attendance: Attendance[];
  overallAverage?: number;
  attendanceRate?: number;
  behaviorScore?: number;
  photoUrl?: string;
  address?: string;
  emergencyContact?: string;
  medicalInfo?: string;
}

export interface TradeInfo {
  name: Trade;
  fullName: string;
  description: string;
  levels: TradeLevel[];
  tools: ToolItem[];
  gallery: GalleryItem[];
  features: string[];
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  imageUrl?: string;
  lastMaintenance?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'workshop' | 'projects' | 'events' | 'achievements';
  date: string;
}

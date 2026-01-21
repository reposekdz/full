import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Users, BookOpen, Briefcase, Trophy, Wrench, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface TeamsPageProps {
  onNavigate: (page: string) => void;
}

const teams = [
  { 
    name: 'Academic Team', 
    role: 'Curriculum & Teaching', 
    icon: BookOpen,
    members: 12,
    head: 'Dr. Sarah Johnson',
    color: 'from-yellow-400 to-amber-500',
    avatar: '👨‍🏫',
    description: 'Manages curriculum development, teaching standards, academic programs, and educational quality assurance across all departments.',
    responsibilities: ['Curriculum Planning', 'Teacher Training', 'Academic Excellence', 'Quality Assurance'],
    email: 'academic@school.edu',
    phone: '+1 (555) 001-0001'
  },
  { 
    name: 'Administration Team', 
    role: 'Management & Operations', 
    icon: Briefcase,
    members: 8,
    head: 'Mr. David Chen',
    color: 'from-yellow-500 to-green-400',
    avatar: '👔',
    description: 'Oversees daily school operations, staff management, policy implementation, and ensures smooth administrative processes.',
    responsibilities: ['Staff Management', 'Policy Implementation', 'Operations', 'Strategic Planning'],
    email: 'admin@school.edu',
    phone: '+1 (555) 002-0002'
  },
  { 
    name: 'Discipline Team', 
    role: 'Student Conduct & Welfare', 
    icon: Users,
    members: 6,
    head: 'Ms. Emily Roberts',
    color: 'from-amber-400 to-yellow-500',
    avatar: '⚖️',
    description: 'Maintains discipline, handles student conduct issues, implements behavioral policies, and promotes positive school culture.',
    responsibilities: ['Conduct Management', 'Behavioral Policies', 'Student Welfare', 'Conflict Resolution'],
    email: 'discipline@school.edu',
    phone: '+1 (555) 003-0003'
  },
  { 
    name: 'Sports Team', 
    role: 'Athletics & Physical Education', 
    icon: Trophy,
    members: 10,
    head: 'Coach Mike Williams',
    color: 'from-lime-400 to-green-500',
    avatar: '🏆',
    description: 'Coordinates sports programs, athletic events, physical education curriculum, and promotes health and fitness among students.',
    responsibilities: ['Sports Programs', 'Athletic Events', 'Physical Education', 'Health & Fitness'],
    email: 'sports@school.edu',
    phone: '+1 (555) 004-0004'
  },
  { 
    name: 'Finance Team', 
    role: 'Accounting & Budget Management', 
    icon: Briefcase,
    members: 5,
    head: 'Mrs. Patricia Lee',
    color: 'from-yellow-600 to-amber-600',
    avatar: '💰',
    description: 'Manages school finances, budgeting, accounting, fee collection, payroll, and ensures financial compliance and transparency.',
    responsibilities: ['Budget Management', 'Accounting', 'Fee Collection', 'Financial Reports'],
    email: 'finance@school.edu',
    phone: '+1 (555) 005-0005'
  },
  { 
    name: 'IT Team', 
    role: 'Technology & Infrastructure', 
    icon: Wrench,
    members: 7,
    head: 'Mr. James Anderson',
    color: 'from-green-400 to-teal-500',
    avatar: '💻',
    description: 'Maintains technology infrastructure, manages school systems, provides technical support, and drives digital transformation initiatives.',
    responsibilities: ['System Management', 'Technical Support', 'Network Security', 'Digital Innovation'],
    email: 'it@school.edu',
    phone: '+1 (555) 006-0006'
  },
  { 
    name: 'Maintenance Team', 
    role: 'Facilities & Equipment', 
    icon: Wrench,
    members: 9,
    head: 'Mr. Robert Martinez',
    color: 'from-yellow-500 to-orange-500',
    avatar: '🔧',
    description: 'Ensures facility upkeep, equipment maintenance, safety compliance, and creates a conducive learning environment for all.',
    responsibilities: ['Facility Maintenance', 'Equipment Repair', 'Safety Compliance', 'Campus Upkeep'],
    email: 'maintenance@school.edu',
    phone: '+1 (555) 007-0007'
  },
];

const TeamsPage: React.FC<TeamsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 p-4 rounded-full mb-4 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-4">
            Management Teams
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Meet our dedicated teams working together to provide excellence in education and school management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team, index) => (
            <motion.div
              key={team.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-2xl h-full">
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-r ${team.color}`}>
                  <div className="absolute top-4 right-4 text-7xl opacity-20">
                    {team.avatar}
                  </div>
                </div>
                
                <CardContent className="pt-20 pb-6 px-6 relative">
                  <div className="flex justify-center -mt-8 mb-4">
                    <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-white">
                      {team.avatar}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{team.role}</p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {team.description}
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between py-2 border-b border-yellow-100">
                      <span className="text-sm font-semibold text-gray-600">Team Head:</span>
                      <span className="text-sm text-gray-900 font-bold">{team.head}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Team Size:</span>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                        {team.members} members
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Key Responsibilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.responsibilities.map((resp, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs border-yellow-300 text-yellow-700 bg-yellow-50"
                        >
                          {resp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-yellow-100">
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="w-3 h-3 mr-2 text-yellow-600" />
                      <span>{team.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="w-3 h-3 mr-2 text-yellow-600" />
                      <span>{team.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-500 to-green-500 border-0 shadow-xl">
            <CardContent className="py-8 px-6">
              <h3 className="text-2xl font-black text-white mb-2">Work With Us</h3>
              <p className="text-white/90 mb-4">
                Interested in joining our teams? We're always looking for passionate individuals.
              </p>
              <button
                onClick={() => onNavigate('contactUs')}
                className="bg-white text-yellow-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-all shadow-lg"
              >
                Contact Us
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamsPage;

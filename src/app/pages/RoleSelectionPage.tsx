import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  School,
  DollarSign,
  Package,
  Settings,
  User,
  ArrowRight,
  Sparkles,
  UserCog,
  Crown
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { UserRole } from '@/app/contexts/AuthContext';

interface RoleSelectionPageProps {
  onNavigate: (page: string) => void;
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onNavigate, onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      role: 'school_owner' as UserRole,
      title: 'Umuyobozi w\'Ishuri',
      subtitle: 'School Owner',
      description: 'Ubuyobozi bukomeye bw\'ishuri - Amafaranga, Imikorere, Ibikoresho, Analytics',
      icon: Crown,
      color: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      features: [
        'Supreme Access',
        'Complete Financial Control',
        'School Performance Analytics',
        'Stock Management',
        'Real-time Reports',
        'All Staff & Student Data'
      ],
      badge: 'SUPREME'
    },
    {
      role: 'student' as UserRole,
      title: 'Umunyeshuri',
      subtitle: 'Student Portal',
      description: 'Reba amanota yawe, imyitwarire, n\'ibikorwa byawe',
      icon: User,
      color: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      features: ['Grades & Reports', 'Attendance', 'Schedule', 'Assignments']
    },
    {
      role: 'parent' as UserRole,
      title: 'Umubyeyi',
      subtitle: 'Parent Portal',
      description: 'Kugenzura iterambere ry\'umwana wawe',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      features: ['Student Progress', 'Communication', 'Payments', 'Reports']
    },
    {
      role: 'advisor' as UserRole,
      title: 'Umujyanama',
      subtitle: 'School Advisor',
      description: 'Gucunga itumanaho ryose, ubujyanama, iterambere ry\'ishuri n\'imibare ngenderwaho',
      icon: UserCog,
      color: 'from-blue-600 to-purple-700',
      bgGradient: 'from-blue-50 to-purple-50',
      features: [
        'Full Student Database Access',
        'Advanced Analytics Dashboard',
        'Contact Management',
        'Performance Monitoring',
        'Communication Oversight',
        'School Development Insights',
        'Student Sheets Access',
        'Parent Coordination',
        'Comprehensive Reports'
      ]
    },
    {
      role: 'teacher' as UserRole,
      title: 'Umwarimu',
      subtitle: 'Teacher Portal',
      description: 'Gucunga amaklasi, amanota, n\'abanyeshuri',
      icon: GraduationCap,
      color: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 to-teal-50',
      features: ['Class Management', 'Grading', 'Attendance', 'Lessons']
    },
    {
      role: 'director_of_study' as UserRole,
      title: 'Umuyobozi w\'Amasomo',
      subtitle: 'Director of Studies',
      description: 'Kugenzura amasomo n\'iterambere ry\'abanyeshuri',
      icon: BookOpen,
      color: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-50 to-amber-50',
      features: ['Academic Oversight', 'Curriculum', 'Student Records', 'Reports']
    },
    {
      role: 'director_of_discipline' as UserRole,
      title: 'Umuyobozi w\'Imyitwarire',
      subtitle: 'Director of Discipline',
      description: 'Gucunga imyitwarire y\'abanyeshuri',
      icon: Shield,
      color: 'from-red-500 to-orange-600',
      bgGradient: 'from-red-50 to-orange-50',
      features: ['Conduct Records', 'Disciplinary Actions', 'Rewards', 'Reports']
    },
    {
      role: 'head_master' as UserRole,
      title: 'Umuyobozi Mukuru',
      subtitle: 'Head Master',
      description: 'Kugenzura ishuri ryose',
      icon: School,
      color: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      features: ['School Management', 'Staff Oversight', 'Strategic Planning', 'Analytics']
    },
    {
      role: 'accountant' as UserRole,
      title: 'Accountant',
      subtitle: 'Financial Manager',
      description: 'Gucunga amafaranga n\'imari',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      features: ['Financial Management', 'Payments', 'Budgets', 'Reports']
    },
    {
      role: 'stock_manager' as UserRole,
      title: 'Umukozi w\'Ububiko',
      subtitle: 'Stock Manager',
      description: 'Gucunga ibikoresho n\'ububiko',
      icon: Package,
      color: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50',
      features: ['Inventory', 'Supplies', 'Orders', 'Reports']
    },
    {
      role: 'admin' as UserRole,
      title: 'Umuyobozi wa Sistema',
      subtitle: 'System Administrator',
      description: 'Gucunga sisitemu yose',
      icon: Settings,
      color: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-50',
      features: ['System Settings', 'User Management', 'Security', 'Maintenance']
    }
  ];

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    setTimeout(() => {
      onRoleSelect(role);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
              Hitamo Uruhare Rwawe
            </h1>
            <Sparkles className="h-8 w-8 text-green-500 ml-2" />
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Select Your Role to Access Your Dashboard
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-6 py-2">
            TVET School Management System
          </Badge>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((roleData, index) => {
            const Icon = roleData.icon;
            const isSelected = selectedRole === roleData.role;
            
            return (
              <motion.div
                key={roleData.role}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer border-4 transition-all duration-300 ${
                    isSelected 
                      ? 'border-yellow-500 shadow-2xl' 
                      : 'border-yellow-200 hover:border-green-400 hover:shadow-xl'
                  } bg-gradient-to-br ${roleData.bgGradient} overflow-hidden group`}
                  onClick={() => handleRoleClick(roleData.role)}
                >
                  <CardContent className="p-6">
                    {/* Icon Section */}
                    <div className="relative mb-4">
                      {roleData.badge && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold animate-pulse">
                            {roleData.badge}
                          </Badge>
                        </div>
                      )}
                      <motion.div
                        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${roleData.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </motion.div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2"
                        >
                          <ArrowRight className="h-5 w-5 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {roleData.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {roleData.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-center text-gray-700 mb-4 min-h-12">
                      {roleData.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {roleData.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + idx * 0.1 }}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleData.color} mr-2`} />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${roleData.color} text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                    >
                      Injira
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${roleData.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            onClick={() => onNavigate('home')}
            className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-lg px-8 py-3"
          >
            Subira Ahabanza
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

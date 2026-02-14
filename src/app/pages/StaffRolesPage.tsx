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
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { UserRole } from '@/app/contexts/AuthContext';

interface StaffRolesPageProps {
  onNavigate: (page: string) => void;
}

// Staff role configurations (excluding parent)
const staffRoles = [
  {
    role: 'advisor' as UserRole,
    title: "Umujyanama w'Ishuri",
    subtitle: 'School Advisor',
    description: "Gucunga inama, gukurikirana iterambere ry'ishuri n'abanyeshuri",
    icon: Users,
    color: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-50'
  },
  {
    role: 'director_study' as UserRole,
    title: "Umuyobozi w'Amasomo",
    subtitle: 'Director of Studies',
    description: "Gucunga amasomo n'iterambere ry'abanyeshuri",
    icon: BookOpen,
    color: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-50 to-amber-50'
  },
  {
    role: 'director_discipline' as UserRole,
    title: "Umuyobozi w'Imyitwarire",
    subtitle: 'Director of Discipline',
    description: "Gucunga imyitwarire y'abanyeshuri",
    icon: Shield,
    color: 'from-red-500 to-orange-600',
    bgGradient: 'from-red-50 to-orange-50'
  },
  {
    role: 'headmaster' as UserRole,
    title: 'Umuyobozi Mukuru',
    subtitle: 'Head Master',
    description: 'Kugenzura ishuri ryose',
    icon: School,
    color: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-50 to-violet-50'
  },
  {
    role: 'teacher' as UserRole,
    title: 'Umwarimu',
    subtitle: 'Teacher Portal',
    description: "Gucunga amaklasi, amanota, n'abanyeshuri",
    icon: GraduationCap,
    color: 'from-green-500 to-teal-600',
    bgGradient: 'from-green-50 to-teal-50'
  },
  {
    role: 'accountant' as UserRole,
    title: 'Umubare',
    subtitle: 'Accountant',
    description: "Gucunga amafaranga n'imari",
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50'
  },
  {
    role: 'stock_manager' as UserRole,
    title: "Umukozi w'Ububiko",
    subtitle: 'Stock Manager',
    description: "Gucunga ibikoresho n'ububiko",
    icon: Package,
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50'
  },
  {
    role: 'admin' as UserRole,
    title: 'Umuyobozi wa Sistema',
    subtitle: 'System Administrator',
    description: 'Gucunga sisitemu yose',
    icon: Settings,
    color: 'from-slate-500 to-gray-600',
    bgGradient: 'from-slate-50 to-gray-50'
  }
];

const StaffRolesPage: React.FC<StaffRolesPageProps> = ({ onNavigate }) => {
  const handleRoleSelect = (role: UserRole) => {
    // Navigate to role-login with the selected role
    // Store the selected role in sessionStorage so RoleLoginPage can pick it up
    sessionStorage.setItem('selectedRole', role);
    onNavigate('role-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('login')}
            className="text-gray-600 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Subira Inyuma
          </Button>
        </motion.div>

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
            Select Your Staff Role to Access Your Dashboard
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-6 py-2">
            Staff Portal
          </Badge>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffRoles.map((roleData, index) => {
            const Icon = roleData.icon;

            return (
              <motion.div
                key={roleData.role}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-3 transition-all duration-300 border-yellow-200 hover:border-green-400 hover:shadow-xl bg-gradient-to-br ${roleData.bgGradient} overflow-hidden group`}
                  onClick={() => handleRoleSelect(roleData.role)}
                >
                  <CardContent className="p-6">
                    {/* Icon Section */}
                    <div className="relative mb-4">
                      <motion.div
                        className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${roleData.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {roleData.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {roleData.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-center text-gray-600 text-sm mb-4">
                      {roleData.description}
                    </p>

                    {/* Action Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${roleData.color} text-white font-semibold py-2 shadow-md hover:shadow-lg transition-all group-hover:scale-105`}
                    >
                      Injira
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
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
            className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-8 py-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Subira Ahabanza
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffRolesPage;

import React, { useState, useEffect } from 'react';
import { 
  Crown, Shield, Users, DollarSign, Package, BookOpen, 
  ClipboardList, Heart, UserCheck, GraduationCap, Briefcase,
  Check, X, Search, Filter, Plus, Edit, Trash2, Eye
} from 'lucide-react';

const StaffRoleSelection = ({ onSelect, selectedRole }) => {
  const roles = [
    {
      id: 'school_owner',
      name: 'Umuyobozi w\'Ishuri',
      nameEn: 'School Owner',
      icon: <Crown className="w-12 h-12" />,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-300',
      description: 'Ubuyobozi bukomeye bw\'ishuri - Amafaranga, Imikorere, Ibikoresho, Analytics',
      permissions: [
        'Genzura amafaranga yose',
        'Reba imikorere y\'ishuri',
        'Genzura ibikoresho byose',
        'Analytics y\'igihe nyacyo',
        'Raporo zuzuye',
        'Genzura abakozi n\'abanyeshuri'
      ],
      badge: 'SUPREME',
      premium: true
    },
    {
      id: 'admin',
      name: 'Umuyobozi Mukuru',
      nameEn: 'Administrator',
      icon: <Shield className="w-12 h-12" />,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-300',
      description: 'Genzura sisitemu yose y\'ishuri',
      permissions: [
        'Genzura abanyeshuri',
        'Genzura abakozi',
        'Raporo z\'ishuri',
        'Amakuru y\'ishuri'
      ],
      badge: 'ADMIN'
    },
    {
      id: 'headmaster',
      name: 'Umuyobozi w\'Ishuri',
      nameEn: 'Headmaster',
      icon: <GraduationCap className="w-12 h-12" />,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      description: 'Ubuyobozi bw\'amasomo n\'imyitwarire',
      permissions: [
        'Genzura amasomo',
        'Imyitwarire y\'abanyeshuri',
        'Raporo z\'amasomo',
        'Gahunda y\'ishuri'
      ]
    },
    {
      id: 'accountant',
      name: 'Umubare',
      nameEn: 'Accountant',
      icon: <DollarSign className="w-12 h-12" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      description: 'Genzura amafaranga n\'ubwishyu',
      permissions: [
        'Ubwishyu bw\'abanyeshuri',
        'Amafaranga y\'ishuri',
        'Raporo z\'amafaranga',
        'Ideni n\'inguzanyo'
      ]
    },
    {
      id: 'stock_manager',
      name: 'Umuyobozi w\'Ibikoresho',
      nameEn: 'Stock Manager',
      icon: <Package className="w-12 h-12" />,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      borderColor: 'border-orange-300',
      description: 'Genzura ibikoresho by\'ishuri',
      permissions: [
        'Ibikoresho by\'ishuri',
        'Kugura ibikoresho',
        'Raporo z\'ibikoresho',
        'Inventory management'
      ]
    },
    {
      id: 'teacher',
      name: 'Umwarimu',
      nameEn: 'Teacher',
      icon: <BookOpen className="w-12 h-12" />,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-300',
      description: 'Kwigisha no gusuzuma abanyeshuri',
      permissions: [
        'Kwigisha amasomo',
        'Gusuzuma abanyeshuri',
        'Amanota',
        'Kwitabira'
      ]
    },
    {
      id: 'director_study',
      name: 'Umuyobozi w\'Amasomo',
      nameEn: 'Director of Studies',
      icon: <ClipboardList className="w-12 h-12" />,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-300',
      description: 'Genzura gahunda y\'amasomo',
      permissions: [
        'Gahunda y\'amasomo',
        'Imikorere y\'abanyeshuri',
        'Raporo z\'amasomo',
        'Curriculum'
      ]
    },
    {
      id: 'director_discipline',
      name: 'Umuyobozi w\'Imyitwarire',
      nameEn: 'Director of Discipline',
      icon: <UserCheck className="w-12 h-12" />,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
      borderColor: 'border-red-300',
      description: 'Genzura imyitwarire y\'abanyeshuri',
      permissions: [
        'Imyitwarire y\'abanyeshuri',
        'Ibihano',
        'Raporo z\'imyitwarire',
        'Conduct tracking'
      ]
    },
    {
      id: 'advisor',
      name: 'Umujyanama',
      nameEn: 'Advisor',
      icon: <Heart className="w-12 h-12" />,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
      borderColor: 'border-pink-300',
      description: 'Gufasha abanyeshuri mu bibazo',
      permissions: [
        'Inama z\'abanyeshuri',
        'Gufasha mu bibazo',
        'Raporo z\'inama',
        'Counseling'
      ]
    },
    {
      id: 'patron',
      name: 'Patron',
      nameEn: 'Patron',
      icon: <Users className="w-12 h-12" />,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      borderColor: 'border-teal-300',
      description: 'Gufasha abahungu mu bibazo',
      permissions: [
        'Gufasha abahungu',
        'Imyitwarire',
        'Raporo',
        'Student welfare'
      ]
    },
    {
      id: 'matron',
      name: 'Matron',
      nameEn: 'Matron',
      icon: <Heart className="w-12 h-12" />,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      borderColor: 'border-purple-300',
      description: 'Gufasha abakobwa mu bibazo',
      permissions: [
        'Gufasha abakobwa',
        'Imyitwarire',
        'Raporo',
        'Student welfare'
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState(roles);

  useEffect(() => {
    const filtered = roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Shakisha umwanya..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            onClick={() => onSelect(role.id)}
            className={`${role.bgColor} rounded-2xl p-6 border-2 ${
              selectedRole === role.id ? role.borderColor : 'border-transparent'
            } cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1 relative overflow-hidden group`}
          >
            {/* Premium Badge */}
            {role.premium && (
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                  {role.badge}
                </span>
              </div>
            )}

            {/* Badge */}
            {role.badge && !role.premium && (
              <div className="absolute top-4 right-4">
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {role.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={`bg-gradient-to-br ${role.color} text-white p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
              {role.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{role.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{role.nameEn}</p>
            <p className="text-gray-700 text-sm mb-4">{role.description}</p>

            {/* Permissions */}
            <div className="space-y-2">
              {role.permissions.slice(0, 3).map((permission, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{permission}</span>
                </div>
              ))}
              {role.permissions.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">+{role.permissions.length - 3} ibindi...</p>
              )}
            </div>

            {/* Selected Indicator */}
            {selectedRole === role.id && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-green-500 text-white rounded-full p-2">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffRoleSelection;

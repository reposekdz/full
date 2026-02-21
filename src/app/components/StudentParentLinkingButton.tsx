import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, Clock, XCircle, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  trade_code: string;
  level_number: number;
  gender: string;
  parent_count?: number;
}

interface Props {
  student: Student;
  onLinkApproved?: () => void;
}

export const StudentParentLinkingButton: React.FC<Props> = ({ student, onLinkApproved }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [linkedCount, setLinkedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPendingApplications();
    checkLinkedParents();
  }, [student.id]);

  const checkPendingApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/parent-child-linking-advanced/all-applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      const studentApps = data.applications?.filter((app: any) => 
        app.child_first_name === student.first_name &&
        app.child_last_name === student.last_name &&
        app.child_trade_code === student.trade_code &&
        app.child_level_number === student.level_number &&
        app.status === 'pending'
      ) || [];
      
      setPendingCount(studentApps.length);
    } catch (error) {
      console.error('Error checking applications:', error);
    }
  };

  const checkLinkedParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/parent-child-linking-advanced/smart-match/${student.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      if (data.success) {
        setLinkedCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error checking linked parents:', error);
    }
  };

  const handleClick = () => {
    // Store student info in sessionStorage for the parent linking page
    sessionStorage.setItem('selectedStudent', JSON.stringify({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      student_code: student.student_code,
      trade_code: student.trade_code,
      level_number: student.level_number,
      gender: student.gender
    }));
    
    // Redirect to manual parent linking page
    window.location.href = '/dod-manual-parent-linking';
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      className={`relative ${
        pendingCount > 0 
          ? 'text-orange-600 hover:bg-orange-50 border-orange-300 animate-pulse' 
          : linkedCount > 0 || (student.parent_count && student.parent_count > 0)
          ? 'text-green-600 hover:bg-green-50 border-green-300'
          : 'text-blue-600 hover:bg-blue-50'
      }`}
      title={pendingCount > 0 ? `${pendingCount} pending applications` : 'View parent applications'}
    >
      <Link className="w-4 h-4" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
          {pendingCount}
        </span>
      )}
      {(linkedCount > 0 || (student.parent_count && student.parent_count > 0)) && pendingCount === 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          <CheckCircle className="w-3 h-3" />
        </span>
      )}
    </Button>
  );
};

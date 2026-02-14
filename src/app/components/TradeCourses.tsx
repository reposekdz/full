import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface Course {
  name: string;
  credits: number;
  is_required: boolean;
}

interface Level {
  level_number: number;
  level_name: string;
  courses: Course[];
}

interface TradeCoursesProps {
  tradeCode: string;
}

export const TradeCourses: React.FC<TradeCoursesProps> = ({ tradeCode }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trade-courses-api/trade/${tradeCode}`);
        if (res.data.success) {
          // Group courses by level
          const levelMap = new Map<number, Level>();
          res.data.courses.forEach((course: any) => {
            if (!levelMap.has(course.level_number)) {
              levelMap.set(course.level_number, {
                level_number: course.level_number,
                level_name: course.level_name,
                courses: []
              });
            }
            levelMap.get(course.level_number)!.courses.push({
              name: course.course_name,
              credits: course.credits,
              is_required: course.is_required
            });
          });
          setLevels(Array.from(levelMap.values()).sort((a, b) => a.level_number - b.level_number));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [tradeCode]);

  if (loading) {
    return <div className="text-center py-4">Loading courses...</div>;
  }

  if (levels.length === 0) {
    return <div className="text-center py-4 text-gray-500">No courses available</div>;
  }

  return (
    <div className="space-y-6">
      {levels.map((level) => (
        <div key={level.level_number} className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            {level.level_name}
            <span className="ml-auto text-sm font-normal text-gray-600">
              {level.courses.length} Amasomo
            </span>
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {level.courses.map((course, idx) => (
              <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{course.name}</p>
                  {course.is_required && (
                    <span className="text-xs text-red-600 font-medium">Required</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradeCourses;

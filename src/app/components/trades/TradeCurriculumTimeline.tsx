import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen,
  ChevronRight,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';

interface Level {
  level: string;
  duration: string;
  description: string;
  modules: string[];
  highlights?: string[];
}

interface TradeCurriculumTimelineProps {
  programs: Level[];
  accentColor: string;
  borderColor: string;
  gradientColor: string;
}

const TradeCurriculumTimeline: React.FC<TradeCurriculumTimelineProps> = ({
  programs,
  accentColor,
  borderColor,
  gradientColor
}) => {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(0);

  return (
    <Card className={`border-2 ${borderColor}`}>
      <CardHeader>
        <CardTitle className="text-3xl flex items-center">
          <BookOpen className={`w-8 h-8 mr-3 ${accentColor}`} />
          Curriculum Roadmap
        </CardTitle>
        <CardDescription className="text-lg">
          Your journey from beginner to professional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 hidden md:block" />

          <div className="space-y-6">
            {programs.map((program, index) => {
              const isExpanded = expandedLevel === index;
              const isCompleted = index < (expandedLevel ?? 0);
              const progress = ((index + 1) / programs.length) * 100;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Node */}
                  <div className="hidden md:flex absolute left-4 w-8 h-8 items-center justify-center z-10">
                    <motion.div
                      animate={{
                        scale: isExpanded ? 1.2 : 1,
                        backgroundColor: isExpanded ? '#10B981' : isCompleted ? '#22C55E' : '#E5E7EB'
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                        isExpanded || isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : isExpanded ? (
                        <Star className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <div className="md:ml-20">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`cursor-pointer rounded-xl border-2 transition-all ${
                        isExpanded 
                          ? `${borderColor} shadow-lg` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExpandedLevel(isExpanded ? null : index)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {program.level}
                              </h3>
                              <Badge className={`bg-gradient-to-r ${gradientColor} text-white`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {program.duration}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{program.description}</p>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            className="ml-4"
                          >
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        </div>

                        {/* Expanded Content */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: isExpanded ? 'auto' : 0,
                            opacity: isExpanded ? 1 : 0
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Core Modules:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              {program.modules.map((module, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className={`p-3 rounded-lg bg-gradient-to-r ${gradientColor.replace('from-', 'from-').replace(/to-\w+-\d+/, 'to-white')} border ${borderColor}`}
                                >
                                  <div className="flex items-center">
                                    <CheckCircle2 className={`w-4 h-4 mr-2 ${accentColor}`} />
                                    <span className="text-sm font-medium text-gray-700">{module}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Curriculum Progress</span>
                                  <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              <Button
                                size="sm"
                                className={`bg-gradient-to-r ${gradientColor} text-white`}
                              >
                                Learn More
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeCurriculumTimeline;

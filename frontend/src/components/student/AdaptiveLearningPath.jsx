import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Map, Target, BookOpen, TrendingUp, Brain, CheckCircle2 } from 'lucide-react';

const AdaptiveLearningPath = ({ studentId, subjectId }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [enrolledPaths, setEnrolledPaths] = useState([]);
  const [conceptMastery, setConceptMastery] = useState([]);

  useEffect(() => {
    fetchLearningData();
  }, [studentId, subjectId]);

  const fetchLearningData = async () => {
    const [recsRes, pathsRes] = await Promise.all([
      fetch(`/api/adaptive-learning/recommendations/${studentId}`),
      fetch(`/api/adaptive-learning/paths?student_id=${studentId}`)
    ]);

    setRecommendations(await recsRes.json());
    setEnrolledPaths(await pathsRes.json());
  };

  const enrollInPath = async (pathId) => {
    await fetch(`/api/adaptive-learning/paths/${pathId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    fetchLearningData();
  };

  const getMasteryColor = (level) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Personalized Learning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations?.weak_concepts?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Focus Areas
              </h3>
              <div className="space-y-2">
                {recommendations.weak_concepts.map(concept => (
                  <div key={concept.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{concept.concept_name}</span>
                      <Badge className={getMasteryColor(concept.mastery_level)}>
                        {concept.mastery_level.toFixed(0)}% Mastery
                      </Badge>
                    </div>
                    <Progress value={concept.mastery_level} className="h-2" />
                    <p className="text-sm text-gray-600 mt-2">{concept.concept_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations?.recommended_paths?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Map className="w-5 h-5" />
                Recommended Learning Paths
              </h3>
              <div className="grid gap-4">
                {recommendations.recommended_paths.map(path => (
                  <Card key={path.id} className="border-2 hover:border-purple-500 transition">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{path.path_name}</h4>
                          <Badge className="mt-1">{path.difficulty_level}</Badge>
                        </div>
                        <Button onClick={() => enrollInPath(path.id)}>
                          Enroll
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Estimated Duration: {path.estimated_duration_hours} hours
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Learning Objectives:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {JSON.parse(path.learning_objectives || '[]').slice(0, 3).map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {enrolledPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Learning Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledPaths.map(enrollment => (
                <div key={enrollment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{enrollment.path_name}</h4>
                      <Badge className={
                        enrollment.status === 'completed' ? 'bg-green-500' :
                        enrollment.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }>
                        {enrollment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {enrollment.status === 'completed' && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{enrollment.completion_percentage}%</span>
                    </div>
                    <Progress value={enrollment.completion_percentage} className="h-2" />
                  </div>

                  {enrollment.performance_score && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      Performance Score: {enrollment.performance_score.toFixed(1)}%
                    </div>
                  )}

                  <Button variant="outline" className="mt-3 w-full">
                    Continue Learning
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations?.recommended_resources?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {recommendations.recommended_resources.map(resource => (
                <div key={resource.id} className="p-4 border rounded-lg hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{resource.resource_title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Badge variant="outline">{resource.resource_type}</Badge>
                        <span>⭐ {resource.rating_avg?.toFixed(1)}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        View Resource
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdaptiveLearningPath;

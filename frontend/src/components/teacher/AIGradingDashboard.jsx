import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const AIGradingDashboard = ({ submissionId, submissionType }) => {
  const [grading, setGrading] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestAIGrading = async () => {
    setLoading(true);
    const response = await fetch(`/api/ai-grading/grade/${submissionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_type: submissionType, rubric: {} })
    });
    const data = await response.json();
    setGrading(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGrading();
  }, [submissionId]);

  const fetchGrading = async () => {
    const response = await fetch(`/api/ai-grading/results/${submissionId}/${submissionType}`);
    const data = await response.json();
    setGrading(data);
  };

  if (!grading && !loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Grading</h3>
            <p className="text-gray-600 mb-4">Get instant feedback with advanced AI analysis</p>
            <Button onClick={requestAIGrading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Grade with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>AI is analyzing the submission...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              AI Grading Results
            </CardTitle>
            <Badge className="bg-purple-500">
              {grading.confidence}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold">Score: {grading.score}/100</span>
                <Badge className={grading.score >= 70 ? 'bg-green-500' : 'bg-yellow-500'}>
                  {grading.score >= 70 ? 'Pass' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={grading.score} className="h-3" />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Overall Feedback</h4>
              <p className="text-gray-700">{grading.feedback}</p>
            </div>

            {grading.strengths && grading.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {grading.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {grading.weaknesses && grading.weaknesses.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {grading.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {grading.suggestions && grading.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Suggestions for Next Time</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-700">
                  {grading.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGradingDashboard;

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService, Question } from '../services/assessmentService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Clock, CheckCircle } from 'lucide-react';

export const TakeAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessment(id!),
  });

  const submitMutation = useMutation({
    mutationFn: () => assessmentService.submitAssessment(id!, answers),
    onSuccess: (result) => {
      if (result?.data?.id) {
        navigate('/app/assessments');
      }
    },
  });

  useEffect(() => {
    if (assessmentData?.data) {
      setTimeLeft(assessmentData.data.duration * 60);
    }
  }, [assessmentData]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && assessmentData) {
      submitMutation.mutate();
    }
  }, [timeLeft, assessmentData]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const assessment = assessmentData?.data;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isLoading) return <div className="text-center py-20">Loading assessment...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div>
          <h1 className="text-2xl font-bold">{assessment?.title}</h1>
          <p className="text-gray-600">{assessment?.subject} • {assessment?.totalMarks} marks</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5" />
            <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          <p className="text-sm text-gray-600">Time Remaining</p>
        </div>
      </div>

      <div className="space-y-4">
        {assessment?.questions.map((question: Question, index: number) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1} <span className="text-sm font-normal text-gray-600">({question.marks} marks)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-900">{question.text}</p>

              {question.type === 'MCQ' && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'TRUE_FALSE' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name={question.id}
                      value="True"
                      checked={answers[question.id] === 'True'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name={question.id}
                      value="False"
                      checked={answers[question.id] === 'False'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {question.type === 'SHORT_ANSWER' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  rows={3}
                  placeholder="Type your answer here..."
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
          className="flex-1"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Submit Assessment
        </Button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FileText, Clock, Award, TrendingUp, BookOpen, Trophy, Target } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography'];
const GRADES = ['Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

export const AssessmentsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['assessments', selectedSubject, selectedGrade],
    queryFn: () => {
      if (selectedSubject && selectedGrade) {
        return assessmentService.filterAssessments(selectedSubject, selectedGrade);
      }
      return assessmentService.getAssessments();
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => assessmentService.getMyProgress(),
  });

  const { data: submissionsData } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => assessmentService.getMySubmissions(),
  });

  const assessments = assessmentsData?.data?.content || [];
  const progress = progressData?.data || {};
  const submissions = submissionsData?.data || [];

  const stats = [
    {
      name: 'Available Tests',
      value: assessments.length,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Completed',
      value: submissions.length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      name: 'Average Score',
      value: `${Math.round(progress.averageScore || 0)}%`,
      icon: Trophy,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessments & Quizzes</h1>
        <p className="text-gray-600">Test your knowledge and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative bg-white rounded-xl shadow-lg overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={[
                { value: '', label: 'All Subjects' },
                ...SUBJECTS.map(s => ({ value: s, label: s }))
              ]}
            />
            <Select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              options={[
                { value: '', label: 'All Grades' },
                ...GRADES.map(g => ({ value: g, label: g }))
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {isLoading ? (
        <div className="text-center py-20">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-semibold mb-2">No assessments available</p>
          <p className="text-gray-600">Check back later for new quizzes and tests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment: any) => (
            <Card key={assessment.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{assessment.title}</CardTitle>
                    <p className="text-sm text-gray-600">{assessment.subject} • {assessment.grade}</p>
                  </div>
                  <div className="bg-primary-100 rounded-lg p-2">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{assessment.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{assessment.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span>{assessment.totalMarks} marks</span>
                  </div>
                </div>

                <Link to={`/app/assessments/take/${assessment.id}`}>
                  <Button className="w-full">
                    Start Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Upload, CheckCircle, Users, BarChart, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

export const TeacherDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/teacher/dashboard');
      return response.data.data;
    },
  });

  const { data: myContent } = useQuery({
    queryKey: ['teacher-content'],
    queryFn: async () => {
      const response = await apiClient.get('/teacher/content?page=0&size=5');
      return response.data.data?.content || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Content',
      value: dashboardData?.totalContent || 0,
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Uploaded materials',
    },
    {
      name: 'Published',
      value: dashboardData?.publishedContent || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Live content',
    },
    {
      name: 'Students',
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Active learners',
    },
  ];

  const quickActions = [
    {
      title: 'Create Assessment',
      description: 'Build quizzes and tests',
      icon: FileText,
      path: '/app/teacher/create-assessment',
      gradient: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Upload Content',
      description: 'Share learning materials',
      icon: Upload,
      path: '/app/content/upload',
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Student Progress',
      description: 'View analytics & reports',
      icon: BarChart,
      path: '/app/teacher/analytics',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Browse Library',
      description: 'Explore resources',
      icon: BookOpen,
      path: '/app/library',
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="text-primary-100 text-sm font-medium">Welcome back, Educator!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {dashboardData?.teacherName || 'Teacher'}
          </h1>
          <p className="text-primary-100 text-lg">
            Inspire minds, share knowledge, and make an impact
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="group relative bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`${action.iconBg} rounded-xl p-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${action.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
            </Link>
          );
        })}
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Recent Content</h2>
            <p className="text-sm text-gray-600 mt-1">Recently uploaded materials</p>
          </div>
          <Link to="/app/library" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          {myContent && myContent.length > 0 ? (
            <div className="space-y-3">
              {myContent.map((content: any) => (
                <div key={content.id} className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{content.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {content.subject}
                      </span>
                      <span>•</span>
                      <span>{content.grade}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        content.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {content.published ? 'Published' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-6">Start sharing knowledge with your students</p>
              <Link
                to="/app/content/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                Upload Your First Content
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

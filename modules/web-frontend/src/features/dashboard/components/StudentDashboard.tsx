import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

export const StudentDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/student/dashboard');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Available Content',
      value: dashboardData?.availableContent || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'My Class',
      value: dashboardData?.className || 'N/A',
      icon: Award,
      color: 'bg-green-500',
    },
    {
      name: 'Learning Hours',
      value: '0',
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome, {dashboardData?.studentName || 'Student'}!
        </h1>
        <p className="mt-2 text-primary-100">
          {dashboardData?.className && `Class: ${dashboardData.className}`}
          {dashboardData?.admissionNumber && ` • Adm No: ${dashboardData.admissionNumber}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/library"
          className="bg-white hover:bg-gray-50 border-2 border-primary-200 hover:border-primary-400 p-6 rounded-lg shadow transition group"
        >
          <div className="flex items-center">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Browse Library</h3>
              <p className="text-sm text-gray-600">Explore learning materials</p>
            </div>
          </div>
        </Link>

        <Link
          to="/assessments"
          className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 p-6 rounded-lg shadow transition group"
        >
          <div className="flex items-center">
            <div className="bg-gray-100 group-hover:bg-gray-200 rounded-lg p-3 transition">
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">My Progress</h3>
              <p className="text-sm text-gray-600">Track your learning</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Content</h2>
        </div>
        <div className="p-6">
          {dashboardData?.recentContent && dashboardData.recentContent.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentContent.map((content: any) => (
                <Link
                  key={content.id}
                  to={`/library/${content.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition"
                >
                  <h3 className="font-medium text-gray-900">{content.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{content.subject}</span>
                    <span>•</span>
                    <span>{content.grade}</span>
                    <span>•</span>
                    <span>{content.contentType}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No content available yet</p>
              <Link
                to="/library"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Browse Library
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

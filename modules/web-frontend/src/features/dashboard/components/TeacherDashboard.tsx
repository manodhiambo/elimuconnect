import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Upload, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../lib/axios';

export const TeacherDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/teacher/dashboard');
      return response.data.data;
    },
  });

  const { data: myContent } = useQuery({
    queryKey: ['teacher-content'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/teacher/content?page=0&size=5');
      return response.data.data?.content || [];
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
      name: 'Total Content',
      value: dashboardData?.totalContent || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'Total uploads',
    },
    {
      name: 'Published',
      value: dashboardData?.publishedContent || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Live content',
    },
    {
      name: 'Pending Approval',
      value: dashboardData?.pendingContent || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Awaiting review',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome, {dashboardData?.teacherName || 'Teacher'}!
        </h1>
        <p className="mt-2 text-primary-100">
          Manage your content and share knowledge with students
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/content/upload"
          className="bg-white hover:bg-gray-50 border-2 border-primary-200 hover:border-primary-400 p-6 rounded-lg shadow transition group"
        >
          <div className="flex items-center">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Content</h3>
              <p className="text-sm text-gray-600">Share learning materials</p>
            </div>
          </div>
        </Link>

        <Link
          to="/library"
          className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 p-6 rounded-lg shadow transition group"
        >
          <div className="flex items-center">
            <div className="bg-gray-100 group-hover:bg-gray-200 rounded-lg p-3 transition">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Browse Library</h3>
              <p className="text-sm text-gray-600">Explore resources</p>
            </div>
          </div>
        </Link>
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
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My Recent Content</h2>
          <Link to="/content" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        <div className="p-6">
          {myContent && myContent.length > 0 ? (
            <div className="space-y-4">
              {myContent.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{content.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{content.subject}</span>
                      <span>•</span>
                      <span>{content.grade}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        content.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {content.published ? 'Published' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't uploaded any content yet</p>
              <Link
                to="/content/upload"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Content
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

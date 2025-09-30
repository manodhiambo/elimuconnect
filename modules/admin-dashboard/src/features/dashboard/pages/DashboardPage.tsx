import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { dashboardService } from '../services/dashboardService';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}> = ({ title, value, icon, trend, color }) => (
  <div className={`bg-white rounded-lg shadow-sm border-l-4 ${color} p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => dashboardService.getRecentActivity(10),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statsData = stats?.data;

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Overview of ElimuConnect platform"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={statsData?.totalUsers || 0}
            icon={<Users className="w-10 h-10" />}
            color="border-blue-500"
          />
          <StatCard
            title="Pending Approvals"
            value={statsData?.pendingApprovals || 0}
            icon={<Clock className="w-10 h-10" />}
            color="border-yellow-500"
          />
          <StatCard
            title="Total Schools"
            value={statsData?.totalSchools || 0}
            icon={<Building2 className="w-10 h-10" />}
            color="border-green-500"
          />
          <StatCard
            title="Total Content"
            value={statsData?.totalContent || 0}
            icon={<FileText className="w-10 h-10" />}
            color="border-purple-500"
          />
          <StatCard
            title="Active Users"
            value={statsData?.activeUsers || 0}
            icon={<CheckCircle className="w-10 h-10" />}
            color="border-teal-500"
          />
          <StatCard
            title="New Today"
            value={statsData?.newRegistrationsToday || 0}
            icon={<TrendingUp className="w-10 h-10" />}
            trend="+12% from yesterday"
            color="border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Activity">
            <div className="space-y-4">
              {activity?.data?.map((item: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-600"></div>
                  <div>
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
              {(!activity?.data || activity.data.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link
                to="/users?tab=pending"
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Review Pending Users</span>
                  <span className="text-sm text-primary-600">{statsData?.pendingApprovals || 0} pending</span>
                </div>
              </Link>
              <Link
                to="/content/upload"
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Upload New Content</span>
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
              </Link>
              <Link
                to="/schools/new"
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Add New School</span>
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

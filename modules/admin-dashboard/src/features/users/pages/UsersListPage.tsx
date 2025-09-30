import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { userService } from '../services/userService';
import { User, UserRole } from '@/types';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', activeTab, page, roleFilter],
    queryFn: () => {
      if (activeTab === 'pending') {
        return userService.getPendingUsers(page, 20);
      }
      return userService.getAllUsers(page, 20, roleFilter);
    },
  });

  const users = usersData?.data?.content || [];

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => {
        const roleColors: Record<UserRole, 'info' | 'success' | 'warning' | 'default'> = {
          [UserRole.ADMIN]: 'default',
          [UserRole.TEACHER]: 'info',
          [UserRole.STUDENT]: 'success',
          [UserRole.PARENT]: 'warning',
        };
        return (
          <Badge variant={roleColors[user.role]}>
            {user.role.replace('ROLE_', '')}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge variant={user.active ? 'success' : 'warning'}>
          {user.active ? 'Active' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'school',
      header: 'School',
      render: (user: User) => user.schoolId || '-',
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (user: User) => format(new Date(user.createdAt), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div>
      <Header 
        title="User Management" 
        subtitle="Manage and approve user registrations"
      />

      <div className="p-6">
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setSearchParams({ tab: 'all' })}
            className={`px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'pending' })}
            className={`px-4 py-2 font-medium ${
              activeTab === 'pending'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Approval
          </button>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="TEACHER">Teachers</option>
                <option value="STUDENT">Students</option>
                <option value="PARENT">Parents</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">
              Total: {usersData?.data?.totalElements || 0} users
            </p>
          </div>

          <Table
            data={users}
            columns={columns}
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            isLoading={isLoading}
            emptyMessage="No users found"
          />

          {usersData?.data && usersData.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {usersData.data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= usersData.data.totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

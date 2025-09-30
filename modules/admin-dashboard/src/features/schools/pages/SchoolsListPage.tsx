import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { schoolService } from '../services/schoolService';
import { School } from '@/types';

export const SchoolsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['schools', page],
    queryFn: () => schoolService.getAllSchools(page, 20),
  });

  const schools = schoolsData?.data?.content || [];

  const columns = [
    {
      key: 'name',
      header: 'School Name',
      render: (school: School) => (
        <div>
          <p className="font-medium">{school.name}</p>
          <p className="text-xs text-gray-500">NEMIS: {school.nemisCode}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (school: School) => (
        <Badge variant="info">{school.type}</Badge>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (school: School) => (
        <div className="text-sm">
          <p>{school.county}</p>
          <p className="text-gray-500">{school.subCounty}</p>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (school: School) => school.totalStudents || 0,
    },
    {
      key: 'teachers',
      header: 'Teachers',
      render: (school: School) => school.totalTeachers || 0,
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (school: School) => (
        <Badge 
          variant={
            school.subscriptionTier === 'PREMIUM' ? 'success' :
            school.subscriptionTier === 'BASIC' ? 'info' : 'default'
          }
        >
          {school.subscriptionTier}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (school: School) => (
        <Badge variant={school.active ? 'success' : 'danger'}>
          {school.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <Header 
        title="Schools Management" 
        subtitle="Manage schools registered on the platform"
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Total: {schoolsData?.data?.totalElements || 0} schools
            </p>
          </div>
          <Button onClick={() => navigate('/schools/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add School
          </Button>
        </div>

        <Card>
          <Table
            data={schools}
            columns={columns}
            onRowClick={(school) => navigate(`/schools/${school.id}`)}
            isLoading={isLoading}
            emptyMessage="No schools found"
          />

          {schoolsData?.data && schoolsData.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {schoolsData.data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= schoolsData.data.totalPages - 1}
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

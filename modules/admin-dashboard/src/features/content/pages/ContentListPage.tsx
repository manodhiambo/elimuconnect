import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Upload, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { contentService } from '../services/contentService';
import { Content } from '@/types';

export const ContentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const [page, setPage] = useState(0);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', activeTab, page],
    queryFn: () => {
      if (activeTab === 'pending') {
        return contentService.getPendingContent(page, 20);
      }
      return contentService.getAllContent(page, 20);
    },
  });

  const content = contentData?.data?.content || [];

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (item: Content) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{item.title}</p>
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'contentType',
      header: 'Type',
      render: (item: Content) => (
        <Badge variant="info">{item.contentType}</Badge>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
    },
    {
      key: 'grade',
      header: 'Grade',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Content) => (
        <Badge variant={item.published ? 'success' : 'warning'}>
          {item.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      render: (item: Content) => (
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1 text-gray-400" />
          {item.viewCount}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: Content) => format(new Date(item.createdAt), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div>
      <Header 
        title="Content Management" 
        subtitle="Manage educational content and resources"
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setSearchParams({ tab: 'all' })}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'pending' })}
              className={`px-4 py-2 font-medium ${
                activeTab === 'pending'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Review
            </button>
          </div>

          <Button onClick={() => navigate('/content/upload')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </Button>
        </div>

        <Card>
          <Table
            data={content}
            columns={columns}
            onRowClick={(item) => navigate(`/content/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="No content found"
          />

          {contentData?.data && contentData.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {contentData.data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= contentData.data.totalPages - 1}
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

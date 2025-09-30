import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Trash2, Download, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { contentService } from '../services/contentService';
import toast from 'react-hot-toast';

export const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => contentService.approveContent(id!),
    onSuccess: () => {
      toast.success('Content approved successfully');
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      toast.error('Failed to approve content');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => contentService.publishContent(id!),
    onSuccess: () => {
      toast.success('Content published successfully');
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
    onError: () => {
      toast.error('Failed to publish content');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => contentService.rejectContent(id!, reason),
    onSuccess: () => {
      toast.success('Content rejected');
      setShowRejectModal(false);
      navigate('/content?tab=pending');
    },
    onError: () => {
      toast.error('Failed to reject content');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => contentService.deleteContent(id!),
    onSuccess: () => {
      toast.success('Content deleted');
      navigate('/content');
    },
    onError: () => {
      toast.error('Failed to delete content');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const content = contentData?.data;

  if (!content) {
    return (
      <div className="p-6">
        <p>Content not found</p>
      </div>
    );
  }

  const details = [
    { label: 'Title', value: content.title },
    { label: 'Description', value: content.description },
    { label: 'Content Type', value: content.contentType },
    { label: 'Subject', value: content.subject },
    { label: 'Grade/Level', value: content.grade },
    { label: 'Language', value: content.language },
    { label: 'Difficulty Level', value: content.difficultyLevel },
    { label: 'Author', value: content.author },
    { label: 'Publisher', value: content.publisher || '-' },
    {
      label: 'Tags',
      value: content.tags?.join(', ') || '-',
    },
    {
      label: 'Duration',
      value: `${content.estimatedDurationMinutes} minutes`,
    },
    {
      label: 'File Size',
      value: `${(content.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      label: 'Status',
      value: (
        <Badge variant={content.published ? 'success' : 'warning'}>
          {content.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      label: 'Views',
      value: content.viewCount,
    },
    {
      label: 'Downloads',
      value: content.downloadCount,
    },
    {
      label: 'Rating',
      value: content.ratingCount > 0
        ? `${content.averageRating.toFixed(1)} (${content.ratingCount} ratings)`
        : 'No ratings yet',
    },
    {
      label: 'Created',
      value: format(new Date(content.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      label: 'Created By',
      value: content.createdBy,
    },
  ];

  return (
    <div>
      <Header 
        title="Content Details" 
        subtitle={`Review and manage content: ${content.title}`}
      />

      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate('/content')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Content Information">
              <div className="space-y-4">
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {detail.label}
                    </span>
                    <span className="text-sm text-gray-900 text-right max-w-md">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>

              {content.fileUrl && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => window.open(content.fileUrl, '_blank')}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Content
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card title="Actions">
              <div className="space-y-3">
                {!content.published && (
                  <>
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => approveMutation.mutate()}
                      isLoading={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Content
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Content
                    </Button>
                  </>
                )}

                {content.published ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      contentService.unpublishContent(id!).then(() => {
                        toast.success('Content unpublished');
                        queryClient.invalidateQueries({ queryKey: ['content', id] });
                      })
                    }
                  >
                    Unpublish Content
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => publishMutation.mutate()}
                    isLoading={publishMutation.isPending}
                  >
                    Publish Content
                  </Button>
                )}

                {content.fileUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(content.fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                )}

                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete this content? This action cannot be undone.'
                      )
                    ) {
                      deleteMutation.mutate();
                    }
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Content
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Content"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this content. This will be sent to the content creator.
          </p>
          <Textarea
            label="Rejection Reason"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => rejectMutation.mutate(rejectReason)}
              isLoading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
              className="flex-1"
            >
              Reject Content
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

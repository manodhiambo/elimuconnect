import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { userService } from '../services/userService';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => userService.approveUser(id!),
    onSuccess: () => {
      toast.success('User approved successfully');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Failed to approve user');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => userService.rejectUser(id!, reason),
    onSuccess: () => {
      toast.success('User rejected');
      setShowRejectModal(false);
      navigate('/users?tab=pending');
    },
    onError: () => {
      toast.error('Failed to reject user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteUser(id!),
    onSuccess: () => {
      toast.success('User deleted');
      navigate('/users');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const user = userData?.data;

  if (!user) {
    return (
      <div className="p-6">
        <p>User not found</p>
      </div>
    );
  }

  const renderUserDetails = () => {
    const details: { label: string; value: any }[] = [
      { label: 'Name', value: user.name },
      { label: 'Email', value: user.email },
      { label: 'Phone Number', value: user.phoneNumber || '-' },
      { label: 'Role', value: user.role.replace('ROLE_', '') },
      {
        label: 'Status',
        value: (
          <Badge variant={user.active ? 'success' : 'warning'}>
            {user.active ? 'Active' : 'Pending Approval'}
          </Badge>
        ),
      },
      {
        label: 'Email Verified',
        value: (
          <Badge variant={user.emailVerified ? 'success' : 'warning'}>
            {user.emailVerified ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      {
        label: 'Registered',
        value: format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm'),
      },
    ];

    // Add role-specific fields
    if (user.role === UserRole.TEACHER) {
      details.push(
        { label: 'TSC Number', value: user.tscNumber || '-' },
        { label: 'School ID', value: user.schoolId || '-' },
        { label: 'Qualification', value: user.qualification || '-' },
        {
          label: 'Subjects Taught',
          value: user.subjectsTaught?.join(', ') || '-',
        },
        {
          label: 'Classes Assigned',
          value: user.classesAssigned?.join(', ') || '-',
        }
      );
    }

    if (user.role === UserRole.STUDENT) {
      details.push(
        { label: 'Admission Number', value: user.admissionNumber || '-' },
        { label: 'School ID', value: user.schoolId || '-' },
        { label: 'Class', value: user.className || '-' },
        {
          label: 'Date of Birth',
          value: user.dateOfBirth
            ? format(new Date(user.dateOfBirth), 'MMM dd, yyyy')
            : '-',
        },
        {
          label: 'Parent/Guardian Contact',
          value: user.parentGuardianContact || '-',
        },
        { label: 'County of Residence', value: user.countyOfResidence || '-' }
      );
    }

    if (user.role === UserRole.PARENT) {
      details.push(
        { label: 'National ID', value: user.nationalId || '-' },
        {
          label: 'Children Admission Numbers',
          value: user.childrenAdmissionNumbers?.join(', ') || '-',
        },
        {
          label: 'Relationship to Children',
          value: user.relationshipToChildren || '-',
        },
        { label: 'Address', value: user.address || '-' }
      );
    }

    return details;
  };

  return (
    <div>
      <Header title="User Details" subtitle={`Review and manage user: ${user.name}`} />

      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="User Information">
              <div className="space-y-4">
                {renderUserDetails().map((detail, index) => (
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
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card title="Actions">
              <div className="space-y-3">
                {!user.active && (
                  <>
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => approveMutation.mutate()}
                      isLoading={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve User
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject User
                    </Button>
                  </>
                )}

                {user.active && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      userService.deactivateUser(id!).then(() => {
                        toast.success('User deactivated');
                        queryClient.invalidateQueries({ queryKey: ['user', id] });
                      })
                    }
                  >
                    Deactivate User
                  </Button>
                )}

                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete this user? This action cannot be undone.'
                      )
                    ) {
                      deleteMutation.mutate();
                    }
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Support Contact
                </h4>
                <p className="text-sm text-blue-800">
                  Email: <a href="mailto:manodhiambo@gmail.com" className="underline">manodhiambo@gmail.com</a>
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Phone: <a href="tel:+254703445756" className="underline">0703 445 756</a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User Registration"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this user registration. This
            will be sent to the user via email.
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
              Reject User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

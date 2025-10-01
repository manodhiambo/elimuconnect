import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://elimuconnect.onrender.com';

export const PendingUsersTable = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/users/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      alert('User approved successfully');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/users/${userId}/reject`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      alert('User rejected');
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const users = pendingUsers?.data?.content || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Pending Approvals ({users.length})
      </h3>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending approvals</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        variant="outline"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(user.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            rejectMutation.mutate({ userId: user.id, reason });
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role.replace('ROLE_', '')}</p>
              <p><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</p>
              {selectedUser.tscNumber && (
                <p><strong>TSC Number:</strong> {selectedUser.tscNumber}</p>
              )}
              {selectedUser.schoolId && (
                <p><strong>School ID:</strong> {selectedUser.schoolId}</p>
              )}
            </div>
            <Button onClick={() => setSelectedUser(null)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

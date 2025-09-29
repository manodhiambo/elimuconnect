import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { useState } from 'react';

export const AdminPanelPage = () => {
  const queryClient = useQueryClient();
  const [syncMessage, setSyncMessage] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: adminService.getPendingUsers,
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: adminService.syncPublishers,
    onSuccess: () => {
      setSyncMessage('Publisher sync initiated successfully!');
      setTimeout(() => setSyncMessage(''), 3000);
    },
  });

  const pendingUsers = usersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>
        <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Publishers
        </Button>
      </div>

      {syncMessage && (
        <Alert>
          <AlertDescription>{syncMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pending User Approvals ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {user.role.replace('ROLE_', '')}
                      </span>
                      {user.tscNumber && (
                        <span className="text-xs text-muted-foreground">
                          TSC: {user.tscNumber}
                        </span>
                      )}
                      {user.admissionNumber && (
                        <span className="text-xs text-muted-foreground">
                          Adm: {user.admissionNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

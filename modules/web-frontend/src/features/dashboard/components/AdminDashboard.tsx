import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users, School, BookOpen, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Schools',
      value: '45',
      icon: School,
      color: 'text-green-600',
    },
    {
      title: 'Content Items',
      value: '567',
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Pending Approvals',
      value: '12',
      icon: AlertCircle,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the ElimuConnect platform</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users/pending">
            <Button variant="outline">View Pending Users</Button>
          </Link>
          <Button>Sync Publishers</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">John Teacher</p>
                  <p className="text-sm text-muted-foreground">Teacher - TSC123456</p>
                </div>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Jane Student</p>
                  <p className="text-sm text-muted-foreground">Student - ADM2024001</p>
                </div>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Mary Parent</p>
                  <p className="text-sm text-muted-foreground">Parent - 2 children</p>
                </div>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">New content uploaded</p>
                <p className="text-xs text-muted-foreground">Mathematics Grade 7 - 5 minutes ago</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Publisher sync completed</p>
                <p className="text-xs text-muted-foreground">KLB - 2 hours ago</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">New school registered</p>
                <p className="text-xs text-muted-foreground">Nairobi Academy - Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

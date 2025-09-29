import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

export const TeacherDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: 'Total Students',
      value: '156',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Courses',
      value: '4',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Pending Grading',
      value: '23',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Completed Assessments',
      value: '145',
      icon: CheckCircle,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>
        <Link to="/content/upload">
          <Button>Upload Content</Button>
        </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.classesAssigned?.map((className) => (
                <div key={className} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{className}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.subjectsTaught?.join(', ')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Class</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Grade Form 2 Essays</p>
                <p className="text-xs text-muted-foreground">23 submissions</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Prepare Quiz</p>
                <p className="text-xs text-muted-foreground">Mathematics</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Update Attendance</p>
                <p className="text-xs text-muted-foreground">Form 1A, Form 2B</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

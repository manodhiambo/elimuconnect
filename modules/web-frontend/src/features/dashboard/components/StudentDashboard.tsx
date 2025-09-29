import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BookOpen, FileText, Trophy, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const StudentDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: 'Courses Enrolled',
      value: '8',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Assessments Completed',
      value: '24',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Average Score',
      value: '85%',
      icon: Trophy,
      color: 'text-yellow-600',
    },
    {
      title: 'Learning Progress',
      value: '78%',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's your learning overview</p>
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
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Mathematics Quiz 5</p>
                  <p className="text-sm text-muted-foreground">Completed 2 hours ago</p>
                </div>
                <span className="text-green-600 font-semibold">92%</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">English Essay</p>
                  <p className="text-sm text-muted-foreground">Submitted yesterday</p>
                </div>
                <span className="text-yellow-600 font-semibold">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Science Project</p>
                  <p className="text-sm text-muted-foreground">Due in 3 days</p>
                </div>
                <span className="text-red-600 font-semibold">Not Started</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded">
                <p className="font-medium">Biology Test</p>
                <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
                <p className="text-xs text-muted-foreground mt-1">Chapter 5-7</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium">History Quiz</p>
                <p className="text-sm text-muted-foreground">Friday at 2:00 PM</p>
                <p className="text-xs text-muted-foreground mt-1">World War II</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium">Mathematics Final</p>
                <p className="text-sm text-muted-foreground">Next Monday at 9:00 AM</p>
                <p className="text-xs text-muted-foreground mt-1">All chapters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

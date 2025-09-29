import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users, TrendingUp, MessageSquare, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const ParentDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: 'Children',
      value: user?.childrenAdmissionNumbers?.length.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Average Performance',
      value: '82%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Unread Messages',
      value: '3',
      icon: MessageSquare,
      color: 'text-orange-600',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Monitor your children's academic progress</p>
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
            <CardTitle>Children's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.childrenAdmissionNumbers?.map((admNo) => (
                <div key={admNo} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Student {admNo}</p>
                      <p className="text-sm text-muted-foreground">Grade 7A</p>
                    </div>
                    <span className="text-green-600 font-semibold">85%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Mathematics</span>
                      <span>90%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>English</span>
                      <span>82%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Science</span>
                      <span>88%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">New assignment posted</p>
                <p className="text-xs text-muted-foreground">Mathematics - Due Friday</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Attendance alert</p>
                <p className="text-xs text-muted-foreground">1 absence this week</p>
              </div>
              <div className="p-3 border rounded">
                <p className="font-medium text-sm">Parent-teacher meeting</p>
                <p className="text-xs text-muted-foreground">Next Monday at 3:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

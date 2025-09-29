import { UserRole } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users, GraduationCap, BookOpen, Shield } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  const roles = [
    {
      role: UserRole.ADMIN,
      title: 'Administrator',
      description: 'Manage schools, approve users, and oversee the platform',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      role: UserRole.TEACHER,
      title: 'Teacher',
      description: 'Create content, manage classes, and track student progress',
      icon: GraduationCap,
      color: 'text-blue-600',
    },
    {
      role: UserRole.STUDENT,
      title: 'Student',
      description: 'Access learning materials, take assessments, and track progress',
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      role: UserRole.PARENT,
      title: 'Parent/Guardian',
      description: 'Monitor your children\'s progress and communicate with teachers',
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Role</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map(({ role, title, description, icon: Icon, color }) => (
          <Card
            key={role}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectRole(role)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className={`h-8 w-8 ${color}`} />
                <CardTitle>{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

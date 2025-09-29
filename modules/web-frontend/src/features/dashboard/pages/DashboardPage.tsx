import { useAuthStore } from '../../../store/authStore';
import { UserRole } from '../../../types';
import { StudentDashboard } from '../components/StudentDashboard';
import { TeacherDashboard } from '../components/TeacherDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { ParentDashboard } from '../components/ParentDashboard';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.TEACHER:
      return <TeacherDashboard />;
    case UserRole.STUDENT:
      return <StudentDashboard />;
    case UserRole.PARENT:
      return <ParentDashboard />;
    default:
      return <div>Invalid role</div>;
  }
};

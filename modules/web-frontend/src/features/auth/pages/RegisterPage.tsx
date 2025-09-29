import { useState } from 'react';
import { UserRole } from '../../../types';
import { RoleSelector } from '../components/RoleSelector';
import { AdminRegistrationForm } from '../components/AdminRegistrationForm';
import { TeacherRegistrationForm } from '../components/TeacherRegistrationForm';
import { StudentRegistrationForm } from '../components/StudentRegistrationForm';
import { ParentRegistrationForm } from '../components/ParentRegistrationForm';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const renderRegistrationForm = () => {
    switch (selectedRole) {
      case UserRole.ADMIN:
        return <AdminRegistrationForm />;
      case UserRole.TEACHER:
        return <TeacherRegistrationForm />;
      case UserRole.STUDENT:
        return <StudentRegistrationForm />;
      case UserRole.PARENT:
        return <ParentRegistrationForm />;
      default:
        return <RoleSelector onSelectRole={setSelectedRole} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-4xl">
        {selectedRole && (
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to role selection
          </Button>
        )}
        {renderRegistrationForm()}
      </div>
    </div>
  );
};

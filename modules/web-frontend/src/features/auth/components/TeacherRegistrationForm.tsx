import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { authService } from '../services/authService';

const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid Kenyan phone number (e.g., +254712345678)'),
  tscNumber: z.string().min(5, 'TSC number is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  qualification: z.string().min(1, 'Qualification is required'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics',
  'History', 'Geography', 'CRE', 'IRE', 'Business Studies', 'Computer Studies'
];

const CLASSES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

export const TeacherRegistrationForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.registerTeacher,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed');
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }
    if (selectedClasses.length === 0) {
      setError('Please select at least one class');
      return;
    }

    setError('');
    registerMutation.mutate({
      ...data,
      subjectsTaught: selectedSubjects,
      classesAssigned: selectedClasses,
    });
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Registration successful! Your account is pending approval. You will receive an email once approved.
              Redirecting to login...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teacher Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="teacher@school.ke"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Phone Number"
              placeholder="+254712345678"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <Input
              label="TSC Number"
              placeholder="TSC123456"
              error={errors.tscNumber?.message}
              {...register('tscNumber')}
            />

            <Input
              label="School ID"
              placeholder="SCH001"
              error={errors.schoolId?.message}
              {...register('schoolId')}
            />

            <Input
              label="Qualification"
              placeholder="Bachelor of Education"
              error={errors.qualification?.message}
              {...register('qualification')}
              className="md:col-span-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Subjects Taught *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="rounded"
                  />
                  <span className="text-sm">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Classes Assigned *
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {CLASSES.map((className) => (
                <label
                  key={className}
                  className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(className)}
                    onChange={() => toggleClass(className)}
                    className="rounded"
                  />
                  <span className="text-sm">{className}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register as Teacher'}
          </Button>

          <div className="text-center text-sm">
            <a href="/login" className="text-primary hover:underline">
              Already have an account? Login
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

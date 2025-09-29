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

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Meru', 'Nyeri', 'Machakos', 'Kiambu'
];

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  className: z.string().min(1, 'Class is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  parentGuardianContact: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number'),
  countyOfResidence: z.string().min(1, 'County is required'),
});

type StudentFormData = z.infer<typeof studentSchema>;

export const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.registerStudent,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed');
    },
  });

  const onSubmit = (data: StudentFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Registration successful! Your account is pending verification. Redirecting to login...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
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
              placeholder="Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="student@email.com"
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
              label="Admission Number"
              placeholder="ADM2024001"
              error={errors.admissionNumber?.message}
              {...register('admissionNumber')}
            />

            <Input
              label="School ID"
              placeholder="SCH001"
              error={errors.schoolId?.message}
              {...register('schoolId')}
            />

            <Input
              label="Class"
              placeholder="Grade 7"
              error={errors.className?.message}
              {...register('className')}
            />

            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            <Input
              label="Parent/Guardian Contact"
              placeholder="+254712345678"
              error={errors.parentGuardianContact?.message}
              {...register('parentGuardianContact')}
            />

            <Select
              label="County of Residence"
              error={errors.countyOfResidence?.message}
              options={KENYAN_COUNTIES.map(county => ({ value: county, label: county }))}
              {...register('countyOfResidence')}
              className="md:col-span-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register as Student'}
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

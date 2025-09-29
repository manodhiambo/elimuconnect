import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { authService } from '../services/authService';

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  adminCode: z.string().min(1, 'Admin code is required'),
  institutionId: z.string().min(1, 'Institution ID is required'),
});

type AdminFormData = z.infer<typeof adminSchema>;

export const AdminRegistrationForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.registerAdmin,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed');
    },
  });

  const onSubmit = (data: AdminFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Admin registration successful! Redirecting to login...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Administrator Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            label="Full Name"
            placeholder="Admin Name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="admin@institution.ke"
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
            label="Admin Code"
            type="password"
            placeholder="OnlyMe@2025"
            error={errors.adminCode?.message}
            {...register('adminCode')}
          />

          <Input
            label="Institution ID"
            placeholder="INST001"
            error={errors.institutionId?.message}
            {...register('institutionId')}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register as Admin'}
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

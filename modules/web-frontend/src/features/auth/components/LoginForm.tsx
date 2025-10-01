import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { Alert, AlertDescription } from '../../../components/ui/Alert';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const token = response.data;
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Debug: Log the payload to see what's in the JWT
        console.log('JWT Payload:', payload);
        
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role, // This should be the role from JWT
        };
        
        console.log('User object:', user);
        
        setAuth(user as any, token);
        navigate('/app/dashboard');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to ElimuConnect</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
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

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center text-sm">
            <a href="/register" className="text-primary hover:underline">
              Don't have an account? Register
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

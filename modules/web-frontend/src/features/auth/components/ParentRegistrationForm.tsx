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
import { X } from 'lucide-react';

const parentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number'),
  nationalId: z.string().regex(/^[0-9]{7,8}$/, 'Invalid National ID'),
  relationshipToChildren: z.string().min(1, 'Relationship is required'),
  address: z.string().min(1, 'Address is required'),
});

type ParentFormData = z.infer<typeof parentSchema>;

export const ParentRegistrationForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [admissionNumbers, setAdmissionNumbers] = useState<string[]>([]);
  const [currentAdmission, setCurrentAdmission] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.registerParent,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed');
    },
  });

  const addAdmissionNumber = () => {
    if (currentAdmission.trim() && !admissionNumbers.includes(currentAdmission.trim())) {
      setAdmissionNumbers([...admissionNumbers, currentAdmission.trim()]);
      setCurrentAdmission('');
    }
  };

  const removeAdmissionNumber = (admission: string) => {
    setAdmissionNumbers(admissionNumbers.filter(a => a !== admission));
  };

  const onSubmit = (data: ParentFormData) => {
    if (admissionNumbers.length === 0) {
      setError('Please add at least one child admission number');
      return;
    }

    setError('');
    registerMutation.mutate({
      ...data,
      childrenAdmissionNumbers: admissionNumbers,
    });
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
        <CardTitle>Parent/Guardian Registration</CardTitle>
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
              placeholder="parent@email.com"
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
              label="National ID"
              placeholder="12345678"
              error={errors.nationalId?.message}
              {...register('nationalId')}
            />

            <Input
              label="Relationship to Children"
              placeholder="Father/Mother/Guardian"
              error={errors.relationshipToChildren?.message}
              {...register('relationshipToChildren')}
            />

            <Input
              label="Address"
              placeholder="P.O. Box 123, Nairobi"
              error={errors.address?.message}
              {...register('address')}
              className="md:col-span-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Children's Admission Numbers *
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter admission number"
                value={currentAdmission}
                onChange={(e) => setCurrentAdmission(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAdmissionNumber();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addAdmissionNumber}
                variant="secondary"
              >
                Add
              </Button>
            </div>
            {admissionNumbers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {admissionNumbers.map((admission) => (
                  <span
                    key={admission}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {admission}
                    <button
                      type="button"
                      onClick={() => removeAdmissionNumber(admission)}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register as Parent'}
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://elimuconnect.onrender.com';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const token = data.data;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          if (!payload.role || !payload.role.includes('ADMIN')) {
            setError('Access denied. Admin privileges required.');
            return;
          }
          
          const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          };
          
          setAuth(user as any, token);
          
          // Use setTimeout to ensure state is updated before navigation
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        } catch (err) {
          setError('Invalid token received');
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

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
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      console.log('Login response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      if (data.success && data.data) {
        const token = data.data;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          
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
          navigate('/dashboard');
        } catch (err) {
          console.error('Token parsing error:', err);
          setError('Invalid token received');
        }
      } else {
        setError('Invalid response from server');
      }
    },
    onError: (err: any) => {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Submitting login with email:', email);
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="admin@elimuconnect.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        API: {API_URL}
      </p>
    </form>
  );
};

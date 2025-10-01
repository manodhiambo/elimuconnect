import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../store/authStore';
import { GraduationCap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Check if token is passed via URL
    const token = searchParams.get('token');
    if (token) {
      // Decode and validate token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        };
        setAuth(user as any, token);
        navigate('/dashboard');
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mt-2">Sign in to manage ElimuConnect</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Support: <a href="mailto:manodhiambo@gmail.com" className="text-primary-600 hover:underline">manodhiambo@gmail.com</a>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Phone: <a href="tel:+254703445756" className="text-primary-600 hover:underline">0703 445 756</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { authAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const VerifyAccount = () => {
  const { verifyAccount, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const watchedCode = watch('verificationCode');

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
    try {
      const result = await verifyAccount({
        email,
        token: data.verificationCode,
        schoolVerificationCode: data.schoolVerificationCode,
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);
    
    try {
      await authAPI.resendVerification(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setResendError(error.message || 'Failed to resend verification email');
      setTimeout(() => setResendError(''), 5000);
    } finally {
      setResendLoading(false);
    }
  };

  // Auto-format verification code input
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('verificationCode', value);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('verifyYourAccount') || 'Verify Your Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('verificationEmailSent') || "We've sent a verification email to"}{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {email}
            </span>
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('verificationCode') || 'Verification Code'}
              </label>
              <input
                {...register('verificationCode', {
                  required: t('verificationCodeRequired') || 'Verification code is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: t('verificationCodeFormat') || 'Please enter a 6-digit code',
                  },
                })}
                type="text"
                maxLength="6"
                value={watchedCode || ''}
                onChange={handleCodeChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              {errors.verificationCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.verificationCode.message}
                </p>
              )}
            </div>

            {/* School Verification (for students/teachers) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('schoolVerificationCode') || 'School Verification Code'} 
                <span className="text-gray-500">({t('optional') || 'optional'})</span>
              </label>
              <input
                {...register('schoolVerificationCode')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('enterSchoolCode') || 'Enter school verification code'}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('schoolCodeHelp') || 'This code is provided by your school administration'}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !watchedCode || watchedCode.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                t('verifyAccount') || 'Verify Account'
              )}
            </button>
          </div>

          {/* Resend Code */}
          <div className="text-center space-y-2">
            {resendSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('verificationEmailResent') || 'Verification email sent successfully!'}
              </p>
            )}
            
            {resendError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {resendError}
              </p>
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('didntReceiveCode') || "Didn't receive the code?"}{' '}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 disabled:opacity-50 transition-colors duration-200"
              >
                {resendLoading 
                  ? (t('sending') || 'Sending...')
                  : (t('resendEmail') || 'Resend verification email')
                }
              </button>
            </p>
          </div>
        </motion.form>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('verificationHelp') || 'Verification Help'}
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('checkEmailSpam') || 'Check your email inbox and spam folder'}</li>
                    <li>{t('codeExpires') || 'The verification code expires in 15 minutes'}</li>
                    <li>{t('contactSupport') || 'Contact support if you continue having issues'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Registration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            to="/register"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            ← {t('backToRegistration') || 'Back to Registration'}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;

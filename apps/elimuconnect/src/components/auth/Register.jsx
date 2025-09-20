import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { schoolAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Register = () => {
  const { register: registerUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState([]);
  const [searchingSchools, setSearchingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolValidationError, setSchoolValidationError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    clearErrors,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      schoolId: '',
      schoolName: ''
    }
  });

  const watchedRole = watch('role');

  // Search schools with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (schoolSearchQuery && schoolSearchQuery.length >= 3) {
        searchSchools(schoolSearchQuery);
      } else {
        setSchools([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [schoolSearchQuery]);

  const searchSchools = async (query) => {
    if (query?.length < 3) return;
    
    setSearchingSchools(true);
    try {
      const response = await schoolAPI.searchSchools(query);
      
      // Check the correct nested path: response.data.data.schools
      if (response.data && response.data.data && response.data.data.schools) {
        setSchools(response.data.data.schools);
      } else {
        setSchools([]);
      }
    } catch (error) {
      console.error('Error searching schools:', error);
      setSchools([]);
    } finally {
      setSearchingSchools(false);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSchoolSearchQuery(school.name);
    setValue('schoolId', school._id, { shouldValidate: false });
    setValue('schoolName', school.name, { shouldValidate: false });
    setSchools([]);
    setSchoolValidationError(''); // Clear any validation errors
    clearErrors(['schoolId', 'schoolName']);
  };

  const handleSchoolSearchChange = (e) => {
    const value = e.target.value;
    setSchoolSearchQuery(value);
    
    // Clear validation error when user starts typing
    setSchoolValidationError('');
    
    if (!value || (selectedSchool && !selectedSchool.name.toLowerCase().includes(value.toLowerCase()))) {
      setSelectedSchool(null);
      setValue('schoolId', '', { shouldValidate: false });
      setValue('schoolName', '', { shouldValidate: false });
    }
  };

  const onSubmit = async (data) => {
    // Ensure school data is included in submission
    if (selectedSchool) {
      data.schoolId = selectedSchool._id;
      data.schoolName = selectedSchool.name;
    }
    
    const result = await registerUser(data);
    if (result.success) {
      navigate('/verify', { state: { email: data.email } });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'role'];
    } else if (step === 2) {
      // Validate role-specific fields first
      if (watchedRole === 'student') {
        fieldsToValidate.push('level', 'grade', 'studentId');
      } else if (watchedRole === 'teacher') {
        fieldsToValidate.push('tscNumber');
      }
      
      // Validate other fields first
      const isValid = await trigger(fieldsToValidate);
      
      // Check school selection separately with custom validation
      if (!selectedSchool) {
        setSchoolValidationError(t('pleaseSelectSchool') || 'Please search and select a school before proceeding.');
        return;
      }
      
      if (isValid) {
        setStep(step + 1);
      }
      return;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('createAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t('signInHere')}
            </Link>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-8 h-1 mx-2 transition-colors duration-200 ${
                    step > stepNumber
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <motion.form
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('basicInformation')}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('firstName')}
                  </label>
                  <input
                    {...register('firstName', { required: t('firstNameRequired') })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('enterFirstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('lastName')}
                  </label>
                  <input
                    {...register('lastName', { required: t('lastNameRequired') })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('enterLastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('email')}
                </label>
                <input
                  {...register('email', {
                    required: t('emailRequired'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t('emailInvalid'),
                    },
                  })}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterEmail')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('phoneNumber')}
                </label>
                <input
                  {...register('phone', { required: t('phoneRequired') })}
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="+254 700 000 000"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('role')}
                </label>
                <select
                  {...register('role', { required: t('roleRequired') })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('selectRole')}</option>
                  <option value="student">{t('student')}</option>
                  <option value="teacher">{t('teacher')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {t('next')}
              </button>
            </div>
          )}

          {/* Step 2: School Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('schoolInformation')}
              </h3>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('searchSchool')}
                </label>
                <input
                  value={schoolSearchQuery}
                  onChange={handleSchoolSearchChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    selectedSchool
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : schoolValidationError
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('typeSchoolName')}
                />
                
                {/* Custom validation error for school selection */}
                {schoolValidationError && (
                  <p className="mt-1 text-sm text-red-600">{schoolValidationError}</p>
                )}
                
                {/* Selected school indicator */}
                {selectedSchool && (
                  <div className="mt-2 flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      {t('schoolSelected')}: {selectedSchool.name}
                    </span>
                  </div>
                )}
                
                {searchingSchools && (
                  <div className="mt-2 flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-500">{t('searchingSchools')}</span>
                  </div>
                )}

                {schools.length > 0 && !selectedSchool && (
                  <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-lg">
                    {schools.map((school) => (
                      <button
                        key={school._id}
                        type="button"
                        onClick={() => handleSchoolSelect(school)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm transition-colors duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{school.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{school.county}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Helpful messages */}
                {!selectedSchool && schoolSearchQuery.length >= 3 && schools.length === 0 && !searchingSchools && (
                  <p className="mt-1 text-sm text-amber-600">{t('noSchoolsFound')}</p>
                )}
                
                {!selectedSchool && schoolSearchQuery.length > 0 && schoolSearchQuery.length < 3 && (
                  <p className="mt-1 text-sm text-gray-500">{t('typeAtLeast3Characters')}</p>
                )}

                {/* Hidden inputs for form submission - NO validation attributes */}
                <input
                  type="hidden"
                  value={selectedSchool?._id || ''}
                  {...register('schoolId')}
                />
                <input
                  type="hidden"
                  value={selectedSchool?.name || ''}
                  {...register('schoolName')}
                />
              </div>

              {watchedRole === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('level')}
                    </label>
                    <select
                      {...register('level', { required: t('levelRequired') })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('selectLevel')}</option>
                      <option value="Primary">{t('primary')}</option>
                      <option value="Secondary">{t('secondary')}</option>
                    </select>
                    {errors.level && (
                      <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('grade')}
                    </label>
                    <select
                      {...register('grade', { required: t('gradeRequired') })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('selectGrade')}</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
                    </select>
                    {errors.grade && (
                      <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('studentId')}
                    </label>
                    <input
                      {...register('studentId', { required: t('studentIdRequired') })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={t('enterStudentId')}
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                    )}
                  </div>
                </>
              )}

              {watchedRole === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tscNumber')}
                  </label>
                  <input
                    {...register('tscNumber', { required: t('tscNumberRequired') })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('enterTscNumber')}
                  />
                  {errors.tscNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.tscNumber.message}</p>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password & Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('securitySettings')}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <input
                  {...register('password', {
                    required: t('passwordRequired'),
                    minLength: {
                      value: 6,
                      message: t('passwordMinLength'),
                    },
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('enterPassword')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('confirmPassword')}
                </label>
                <input
                  {...register('confirmPassword', {
                    required: t('confirmPasswordRequired'),
                    validate: (value) =>
                      value === watch('password') || t('passwordsDoNotMatch'),
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('confirmYourPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  {...register('agreeTerms', { required: t('mustAgreeTerms') })}
                  id="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {t('agreeToTerms')}{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    {t('termsOfService')}
                  </Link>{' '}
                  {t('and')}{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    {t('privacyPolicy')}
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeTerms.message}</p>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('back')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('createAccount')}
                </button>
              </div>
            </div>
          )}
    </motion.form>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('registrationHelp')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;

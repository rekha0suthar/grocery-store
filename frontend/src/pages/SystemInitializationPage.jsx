import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Shield, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { checkInitializationStatus, initializeSystem } from '../store/slices/authSlice.js';
import { validateUserRegistration } from '../utils/validation.js';
import Button from '../components/UI/Button.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

export const SystemInitializationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { systemInitialized, initializationLoading, loading, error } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },

    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin'
    }
  });


  useEffect(() => {
    dispatch(checkInitializationStatus());
  }, [dispatch]);

  useEffect(() => {
    if (systemInitialized === true) {
      navigate('/login');
    }
  }, [systemInitialized, navigate]);

  const hasError = (fieldName) => {
    return errors[fieldName];
  };

  const onSubmit = async (data) => {
    try {
      clearErrors();

      const validation = validateUserRegistration(data);
      if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
          setError(field, {
            type: 'manual',
            message: validation.errors[field]
          });
        });
        return;
      }

      const result = await dispatch(initializeSystem(data));

      if (result.type.endsWith('/fulfilled')) {
        toast.success('System initialized successfully! Welcome, Admin!');
        navigate('/dashboard');
      } else {
        toast.error(result.payload || 'System initialization failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  if (initializationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (systemInitialized === true) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            System Initialization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create the first administrator account to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('name') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('name', {
                    required: 'Name is required'
                  })}
                />
              </div>
              {hasError('name') && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('email', {
                    required: 'Email is required'
                  })}
                />
              </div>
              {hasError('email') && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('password') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('password', {
                    required: 'Password is required'
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {hasError('password') && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password'
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {hasError('confirmPassword') && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Initialize System
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This will create the first administrator account and initialize the system.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemInitializationPage;

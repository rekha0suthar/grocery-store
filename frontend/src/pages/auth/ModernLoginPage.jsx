import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.js';
import { loginUser } from '../../store/slices/authSlice.js';
import { toast } from 'react-hot-toast';
import Button from '../../components/UI/Button.jsx';
import StatusAlert from '../../components/UI/StatusAlert.jsx';
import { Eye, EyeOff, ShoppingCart, Mail, Lock } from 'lucide-react';

const ModernLoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, requestStatus, loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'customer':
        navigate('/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'store_manager':
        navigate('/manager/products');
        break;
      default:
        navigate('/dashboard');
    }
  };

  useEffect(() => {    
    if (!isAuthenticated || !user) {
      return;
    }

    if (user.role === 'store_manager') {
      if (requestStatus?.status === 'approved') {
        redirectBasedOnRole('store_manager');
      }
      return;
    }

   
    redirectBasedOnRole(user.role);
  }, [isAuthenticated, user, requestStatus, navigate, redirectBasedOnRole]);




  const handleFormSubmit = async (data) => {
    
    setValidationErrors({});
    setShowStatusAlert(false);
    setStatusMessage('');
    setIsCheckingStatus(false);
    
    try {
      if (!data.email || !data.password) {
        setValidationErrors({
          email: !data.email ? 'Email is required' : '',
          password: !data.password ? 'Password is required' : ''
        });
        toast.error('Please fill in all fields');
        return;
      }

      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(data.email)) {
        setValidationErrors({ email: 'Invalid email address' });
        toast.error('Please enter a valid email address');
        return;
      }

      if (data.password.length < 6) {
        setValidationErrors({ password: 'Password must be at least 6 characters' });
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      const result = await dispatch(loginUser(data)).unwrap();
      
      const userRole = result.user?.role || 'customer';
      
      const roleGreetings = {
        customer: 'Welcome back! Start shopping now.',
        admin: 'Welcome back, Administrator!',
        store_manager: 'Welcome back, Store Manager!'
      };
      
      toast.success(roleGreetings[userRole] || 'Login successful! Welcome back!');
      
      
    } catch (error) {
      
      setValidationErrors({ general: 'Invalid credentials' });
      toast.error(error || 'Invalid credentials');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  
  const getErrorMessage = (fieldName) => {
    if (validationErrors[fieldName]) {
      return validationErrors[fieldName];
    }
    
    if (errors[fieldName]?.message) {
      return errors[fieldName].message;
    }
    return null;
  };
  
  const hasError = (fieldName) => {
    return !!(validationErrors[fieldName] || errors[fieldName]);
  };

  // Show loading state when Redux loading is true
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Signing in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>

        {showStatusAlert && (
          <div className="mb-4">
            <StatusAlert
              status={requestStatus?.status || 'pending'}
              message={statusMessage || requestStatus?.message || 'Your registration request is pending approval from an administrator.'}
              request={requestStatus?.request || {
                id: 'test-123',
                status: 'pending',
                createdAt: new Date().toISOString()
              }}
              profile={requestStatus?.profile || {
                storeName: 'Test Store',
                storeAddress: '123 Test Street'
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {getErrorMessage('email') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('password') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {getErrorMessage('password') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('password')}</p>
              )}
            </div>

            {(validationErrors.general || error) && (
              <div className="text-red-600 text-sm text-center">
                {validationErrors.general || error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading || isCheckingStatus}
            >
              {isCheckingStatus ? 'Checking Status...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernLoginPage;

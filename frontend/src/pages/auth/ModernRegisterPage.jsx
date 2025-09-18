import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  UserCheck,
  Store,
  MapPin
} from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice.js';
import { validateUserRegistration } from '../../utils/validation.js';
import Button from '../../components/UI/Button.jsx';

export const ModernRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'customer',
      storeName: '',
      storeAddress: ''
    }
  });

  const selectedRole = watch('role');

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const hasError = (fieldName) => {
    return errors[fieldName];
  };

  const getErrorMessage = (fieldName) => {
    return errors[fieldName]?.message;
  };

  const onSubmit = async (data) => {
    try {
      clearErrors();

      const registrationData = {
        ...data,
        name: `${data.firstName} ${data.lastName || ''}`.trim()
      };

      const validation = validateUserRegistration(registrationData);
      
      if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
          setError(field, {
            type: 'manual',
            message: validation.errors[field]
          });
        });
        toast.error('Please fix the validation errors before submitting');
        return;
      }

      const result = await dispatch(registerUser(registrationData));
      
      if (result.type.endsWith('/fulfilled')) {
        if (result.payload.requiresApproval) {
          toast.success('Registration submitted! Your request has been sent to an administrator for approval.');
          navigate('/login', { 
            state: { 
              message: 'Your store manager registration is pending approval. You will be able to login once an administrator approves your request.' 
            }
          });
        } else {
          toast.success('Registration successful! Please login to continue.');
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login with your credentials.' 
            }
          });
        }
      } else {
        toast.error(result.payload || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <select
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    hasError('role') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('role', {
                    required: 'Please select an account type'
                  })}
                >
                  <option value="customer">Customer</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                {getErrorMessage('role') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('role')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        hasError('firstName') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('firstName', {
                        required: 'First name is required'
                      })}
                    />
                  </div>
                  {getErrorMessage('firstName') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('firstName')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name (optional)"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        hasError('lastName') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('lastName')}
                    />
                  </div>
                  {getErrorMessage('lastName') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('lastName')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      hasError('email') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('email', {
                      required: 'Email is required'
                    })}
                  />
                </div>
                {getErrorMessage('email') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number (optional)"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      hasError('phone') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('phone')}
                  />
                </div>
                {getErrorMessage('phone') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage('phone')}</p>
                )}
              </div>

              {selectedRole === 'store_manager' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Enter your store name"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          hasError('storeName') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        {...register('storeName', {
                          required: selectedRole === 'store_manager' ? 'Store name is required' : false
                        })}
                      />
                    </div>
                    {getErrorMessage('storeName') && (
                      <p className="mt-1 text-sm text-red-600">{getErrorMessage('storeName')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Enter your store address"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          hasError('storeAddress') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        {...register('storeAddress', {
                          required: selectedRole === 'store_manager' ? 'Store address is required' : false
                        })}
                      />
                    </div>
                    {getErrorMessage('storeAddress') && (
                      <p className="mt-1 text-sm text-red-600">{getErrorMessage('storeAddress')}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <UserCheck className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Store Manager Registration
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Your registration will be sent to an administrator for approval. 
                            You will be able to login once your request is approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        hasError('password') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('password', {
                        required: 'Password is required'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {getErrorMessage('password') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('password')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        hasError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {getErrorMessage('confirmPassword') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('confirmPassword')}</p>
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
                {selectedRole === 'store_manager' ? 'Submit for Approval' : 'Create Account'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Grocery store"
        />
        <div className="absolute inset-0 bg-green-700 mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Join Our Grocery Network
            </h2>
            <p className="text-xl text-green-100">
              Connect with customers and grow your business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRegisterPage;

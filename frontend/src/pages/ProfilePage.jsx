import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { updateProfile } from '../store/slices/authSlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'store_manager':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 mb-2">{user?.email}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    error={errors.firstName?.message}
                    {...register('firstName', {
                      required: 'First name is required',
                    })}
                  />

                  <Input
                    label="Last Name"
                    type="text"
                    error={errors.lastName?.message}
                    {...register('lastName', {
                      required: 'Last name is required',
                    })}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Invalid phone number',
                    },
                  })}
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full md:w-auto"
                >
                  Update Profile
                </Button>
              </form>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

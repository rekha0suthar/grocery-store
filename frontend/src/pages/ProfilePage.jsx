import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { updateProfile } from '../store/slices/authSlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import { User, Mail, Phone, Calendar, Edit3, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
        phone: user?.phone || '',
        address: user?.address || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      // Include email in the payload to satisfy backend validation
      const payload = { 
        ...data, 
        email: user?.email 
      };
      
      console.log('Submitting profile data:', payload);
      const result = await dispatch(updateProfile(payload)).unwrap();
      console.log('Profile update result:', result);
      
      // Check if the update was successful
      if (result && result.success !== false) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        // Show error message from backend
        const errorMessage = result?.message || 'Failed to update profile';
        toast.error(errorMessage);
        console.error('Profile update failed:', result);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    reset({
      name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
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

  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Centered Profile Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Card className="p-8 shadow-xl">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {getDisplayName()}
                </h2>
                <p className="text-gray-500 mb-4 text-lg">{user?.email}</p>
                <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-8">
                <Button
                  onClick={handleEditClick}
                  className="w-full flex items-center justify-center space-x-2 py-3"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Profile Form Popup */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Popup Header */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Edit3 className="w-5 h-5 mr-2 text-green-600" />
                      Edit Profile
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Popup Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Full Name"
                    type="text"
                    {...register('name')}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    {...register('phone')}
                  />

                  <Input
                    label="Address"
                    type="text"
                    {...register('address')}
                  />

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="px-8"
                    >
                      Update Profile
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

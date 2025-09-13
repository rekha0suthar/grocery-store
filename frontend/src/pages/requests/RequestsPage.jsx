import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchRequests, createStoreManagerRequest } from '../../store/slices/requestSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const RequestsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests, loading } = useAppSelector((state) => state.requests);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const onSubmit = async (data) => {
    setCreateLoading(true);
    try {
      await dispatch(createStoreManagerRequest(data)).unwrap();
      toast.success('Request submitted successfully!');
      setShowCreateForm(false);
      reset();
      dispatch(fetchRequests());
    } catch (error) {
      toast.error(error || 'Failed to submit request');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600">View and manage your store manager requests</p>
        </div>
        
        {user?.role === 'customer' && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Create Store Manager Registration Request</h3>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Reason"
                type="text"
                placeholder="Why do you want to become a store manager?"
                error={errors.reason?.message}
                {...register('reason', {
                  required: 'Reason is required',
                  minLength: {
                    value: 10,
                    message: 'Reason must be at least 10 characters',
                  },
                })}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={createLoading}
                  className="flex-1"
                >
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Store Manager Registration Request
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{request.reason}</p>
                </div>
                
                {request.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</h4>
                    <p className="text-sm text-gray-600">{request.adminNotes}</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {user?.role === 'customer' 
              ? 'You haven\'t submitted any store manager requests yet.'
              : 'No requests available.'
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default RequestsPage;

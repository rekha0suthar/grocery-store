import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchRequests, approveRequest, rejectRequest } from '../../store/slices/requestSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { FileText, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveRequest(requestId)).unwrap();
      toast.success('Request approved successfully!');
      dispatch(fetchRequests());
    } catch (error) {
      toast.error(error || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await dispatch(rejectRequest(requestId)).unwrap();
      toast.success('Request rejected successfully!');
      dispatch(fetchRequests());
    } catch (error) {
      toast.error(error || 'Failed to reject request');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Requests</h1>
        <p className="text-gray-600">Review and manage store manager requests</p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request) => {
            const getRequestTypeLabel = (type) => {
              switch (type) {
                case 'account_register_request':
                  return 'Store Manager Registration';
                case 'category_add_request':
                  return 'Category Addition';
                case 'category_update_request':
                  return 'Category Update';
                case 'category_delete_request':
                  return 'Category Deletion';
                default:
                  return 'Request';
              }
            };

            const getRequestTypeColor = (type) => {
              switch (type) {
                case 'account_register_request':
                  return 'bg-blue-100 text-blue-800';
                case 'category_add_request':
                  return 'bg-green-100 text-green-800';
                case 'category_update_request':
                  return 'bg-yellow-100 text-yellow-800';
                case 'category_delete_request':
                  return 'bg-red-100 text-red-800';
                default:
                  return 'bg-gray-100 text-gray-800';
              }
            };

            return (
              <Card key={request.id}>
                <Card.Content>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.type === 'account_register_request' 
                            ? `${request.requestData?.name || 'Store Manager'}`
                            : getRequestTypeLabel(request.type)
                          }
                        </h3>
                        {request.type === 'account_register_request' && request.requestData?.email && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">{request.requestData.email}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          Submitted on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRequestTypeColor(request.type)}`}>
                        {request.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {getStatusIcon(request.status)}
                      <span className={`px-5 py-2 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-gray-900">Request Information</h4>
                    
                    {request.requestData && (
                      <>
                        {request.requestData.storeName && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600">Store Name:</span>
                            <span className="text-xs text-gray-900">{request.requestData.storeName}</span>
                          </div>
                        )}
                        
                        {request.requestData.storeAddress && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600">Store Address:</span>
                            <span className="text-xs text-gray-900">{request.requestData.storeAddress}</span>
                          </div>
                        )}                                  
                      </>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        variant="success"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="danger"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">No store manager requests to review</p>
        </Card>
      )}
    </div>
  );
};

export default AdminRequestsPage;

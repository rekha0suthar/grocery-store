import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Store, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getPendingStoreManagerRequests, 
  approveStoreManagerRequest 
} from '../../store/slices/authSlice.js';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';

export const AdminStoreManagerRequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, requestsLoading, requestsError, user } = useSelector(state => state.auth);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    // Only load if user is admin
    if (user?.role === 'admin') {
      dispatch(getPendingStoreManagerRequests());
    }
  }, [dispatch, user]);

  const handleApprove = async (requestId) => {
    try {
      const result = await dispatch(approveStoreManagerRequest({
        requestId,
        action: 'approve'
      }));

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Store manager request approved successfully!');
        // Refresh the list
        dispatch(getPendingStoreManagerRequests());
      } else {
        toast.error(result.payload || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const result = await dispatch(approveStoreManagerRequest({
        requestId: selectedRequest.id,
        action: 'reject',
        reason: rejectionReason
      }));

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Store manager request rejected');
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        // Refresh the list
        dispatch(getPendingStoreManagerRequests());
      } else {
        toast.error(result.payload || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (requestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Manager Requests</h1>
        <p className="mt-2 text-gray-600">
          Review and manage store manager registration requests
        </p>
      </div>

      {requestsError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{requestsError}</p>
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            All store manager requests have been processed.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.requestData?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">{request.requestData?.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {request.requestData?.storeName && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Store className="h-4 w-4 mr-2 text-gray-400" />
                    {request.requestData.storeName}
                  </div>
                )}
                
                {request.requestData?.storeAddress && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {request.requestData.storeAddress}
                  </div>
                )}

                {request.requestData?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="h-4 w-4 mr-2 text-gray-400">📞</span>
                    {request.requestData.phone}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  disabled={requestsLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => openRejectModal(request)}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  size="sm"
                  disabled={requestsLoading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Reject Store Manager Request
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Please provide a reason for rejecting this request.
                </p>
                <div className="mt-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={4}
                  />
                </div>
                <div className="flex justify-center space-x-3 mt-6">
                  <Button
                    onClick={closeRejectModal}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                    disabled={!rejectionReason.trim() || requestsLoading}
                  >
                    Reject Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreManagerRequestsPage;

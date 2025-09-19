import { Clock, CheckCircle, XCircle, FileText, Plus, Edit, Trash2, Eye, AlertCircle, User, Mail, Phone, MapPin, Building } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchRequests, approveRequest, rejectRequest } from '../../store/slices/requestSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { toast } from 'react-hot-toast';

const AdminRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.requests);
  const { categories } = useAppSelector((state) => state.categories);
  const [expandedRequest, setExpandedRequest] = useState(null);

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchCategories());
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

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'account_register_request':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'category_add_request':
        return <Plus className="w-6 h-6 text-green-600" />;
      case 'category_update_request':
        return <Edit className="w-6 h-6 text-yellow-600" />;
      case 'category_delete_request':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'account_register_request':
        return 'Store Manager Registration';
      case 'category_add_request':
        return 'Add Category';
      case 'category_update_request':
        return 'Update Category';
      case 'category_delete_request':
        return 'Delete Category';
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const renderCategoryRequestSummary = (request) => {
    const { requestData } = request;

    if (!requestData) return null;

    switch (request.type) {
      case 'category_add_request':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">New Category:</span> {requestData.name}
            {requestData.parentId && (
              <span className="ml-2">
                (Parent: {getCategoryName(requestData.parentId)})
              </span>
            )}
          </div>
        );

      case 'category_update_request':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Update Category:</span> {requestData.originalCategory?.name}
            <span className="ml-2">→ {requestData.name}</span>
          </div>
        );

      case 'category_delete_request':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Delete Category:</span> {requestData.originalCategory?.name}
          </div>
        );

      default:
        return null;
    }
  };

  const renderStoreManagerRequestSummary = (request) => {
    const { requestData } = request;

    if (!requestData) return null;

    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">Store:</span> {requestData.storeName}
        <span className="ml-2">
          <span className="font-medium">Email:</span> {requestData.email}
        </span>
      </div>
    );
  };

  const renderDetailedStoreManagerRequest = (request) => {
    const { requestData } = request;

    if (!requestData) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Store Manager Registration Details
        </h4>
        <div className="bg-blue-50 p-6 rounded-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <User className="w-4 h-4 mr-1" />
                Full Name
              </label>
              <p className="text-lg font-semibold text-gray-900">{requestData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email Address
              </label>
              <p className="text-lg text-gray-900">{requestData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Phone Number
              </label>
              <p className="text-lg text-gray-900">{requestData.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Building className="w-4 h-4 mr-1" />
                Store Name
              </label>
              <p className="text-lg text-gray-900">{requestData.storeName}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Store Address
              </label>
              <p className="text-lg text-gray-900">{requestData.storeAddress}</p>
            </div>
          </div>

          {requestData.reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Application</label>
              <p className="text-gray-900 bg-white p-3 rounded border">{requestData.reason}</p>
            </div>
          )}

          {requestData.experience && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previous Experience</label>
              <p className="text-gray-900 bg-white p-3 rounded border">{requestData.experience}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDetailedCategoryRequest = (request) => {
    const { requestData } = request;

    if (!requestData) return null;

    switch (request.type) {
      case 'category_add_request':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-600" />
              New Category Details
            </h4>
            <div className="bg-green-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <p className="text-lg font-semibold text-gray-900">{requestData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <p className="text-lg text-gray-900">
                    {requestData.parentId ? getCategoryName(requestData.parentId) : 'Root Category'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{requestData.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${requestData.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {requestData.isVisible ? 'Visible to customers' : 'Hidden from customers'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'category_update_request':
        const originalCategory = requestData.originalCategory;
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-yellow-600" />
              Category Update Details
            </h4>
            <div className="bg-yellow-50 p-6 rounded-lg space-y-6">
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-3">Category Being Updated</h5>
                <p className="text-lg font-semibold text-gray-900">{originalCategory?.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name Changes</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 line-through bg-gray-100 px-2 py-1 rounded">
                        {originalCategory?.name}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-900 bg-green-100 px-2 py-1 rounded">
                        {requestData.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category Changes</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {originalCategory?.parentId ? getCategoryName(originalCategory.parentId) : 'Root Category'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-900 bg-green-100 px-2 py-1 rounded">
                        {requestData.parentId ? getCategoryName(requestData.parentId) : 'Root Category'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description Changes</label>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Current:</span>
                      <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
                        {originalCategory?.description || 'No description'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">New:</span>
                      <p className="text-sm font-medium text-gray-900 bg-green-100 p-2 rounded">
                        {requestData.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Changes</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${originalCategory?.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {originalCategory?.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${requestData.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {requestData.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
      case 'category_delete_request':
return (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
      <Trash2 className="w-5 h-5 mr-2 text-red-600" />
      Category Deletion Details
    </h4>
    <div className="bg-red-50 p-6 rounded-lg space-y-4">
      <div className="flex items-center space-x-2 p-3 bg-red-100 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-red-800">
          ⚠️ Warning: This action cannot be undone. All products in this category will be affected.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <p className="text-lg font-semibold text-gray-900">{requestData.originalCategory?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <p className="text-lg text-gray-900">
            {requestData.originalCategory?.parentId ? getCategoryName(requestData.originalCategory.parentId) : 'Root Category'}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-900">{requestData.originalCategory?.description || 'No description'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${requestData.originalCategory?.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
            {requestData.originalCategory?.isVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

      default:
return null;
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
        {requests.map((request) => (
          <Card key={request.id}>
            <Card.Content>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getRequestTypeIcon(request.type)}
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
                    {/* Show summary for all request types */}
                    {request.type === 'account_register_request'
                      ? renderStoreManagerRequestSummary(request)
                      : renderCategoryRequestSummary(request)
                    }
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

              {/* Expandable Details */}
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {expandedRequest === request.id ? 'Hide' : 'Show'} Details
                </Button>

                {expandedRequest === request.id && (
                  <div className="mt-4">
                    {request.type === 'account_register_request'
                      ? renderDetailedStoreManagerRequest(request)
                      : renderDetailedCategoryRequest(request)
                    }
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex space-x-4 mt-6">
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
        ))}
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

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { createCategoryRequest, fetchMyRequests } from '../../store/slices/requestSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Plus, Edit, Trash2, FolderOpen, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Select from '../../components/UI/Select.jsx';

const CategoryRequestPage = () => {
  const dispatch = useAppDispatch();
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { myRequests, loading: requestsLoading } = useAppSelector((state) => state.requests);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'requests'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const requestType = watch('requestType');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const getCategoryRequestStatus = (categoryId) => {
    const categoryRequests = myRequests.filter(req => 
      ['category_add_request', 'category_update_request', 'category_delete_request'].includes(req.type)
    );

    const relevantRequests = categoryRequests.filter(req => {
      if (req.type === 'category_add_request') {
        return false; 
      }
      if (req.type === 'category_update_request' || req.type === 'category_delete_request') {
        return req.requestData?.originalCategory?.id === categoryId;
      }
      return false;
    });

    if (relevantRequests.length === 0) {
      return null; 
    }

    const mostRecentRequest = relevantRequests.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return {
      status: mostRecentRequest.status,
      type: mostRecentRequest.type,
      createdAt: mostRecentRequest.createdAt,
      rejectionReason: mostRecentRequest.rejectionReason
    };
  };

  const onSubmit = async (data) => {
    setCreateLoading(true);
    try {
      const requestData = {
        type: data.requestType,
        requestData: {
          name: data.name,
          description: data.description || '',
          parentId: data.parentId || null,
          isVisible: data.isVisible !== undefined ? data.isVisible : true,
          ...(editingCategory && (data.requestType === 'category_update_request' || data.requestType === 'category_delete_request') && {
            originalCategory: {
              id: editingCategory.id,
              name: editingCategory.name,
              description: editingCategory.description,
              parentId: editingCategory.parentId,
              isVisible: editingCategory.isVisible
            }
          })
        }
      };

      await dispatch(createCategoryRequest(requestData)).unwrap();
      
      const actionText = data.requestType === 'category_add_request' ? 'created' : 
                        data.requestType === 'category_update_request' ? 'updated' : 'deleted';
      toast.success(`Category ${actionText} request submitted successfully! An admin will review it.`);
      
      setEditingCategory(null);
      setShowCreateForm(false);
      reset();
      dispatch(fetchMyRequests()); 
    } catch (error) {
      toast.error(error || 'Failed to submit category request');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowCreateForm(true);
    setTimeout(() => {
      reset({
        requestType: 'category_update_request',
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        isVisible: category.isVisible !== undefined ? category.isVisible : true,
      });
    }, 0);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCreateForm(true);
    setTimeout(() => {
      reset({
        requestType: 'category_add_request',
        name: '',
        description: '',
        parentId: '',
        isVisible: true,
      });
    }, 0);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to request deletion of "${category.name}"?`)) {
      setCreateLoading(true);
      try {
        const requestData = {
          type: 'category_delete_request',
          requestData: {
            originalCategory: {
              id: category.id,
              name: category.name,
              description: category.description,
              parentId: category.parentId,
              isVisible: category.isVisible
            }
          }
        };

        await dispatch(createCategoryRequest(requestData)).unwrap();
        toast.success('Category deletion request submitted successfully! An admin will review it.');
        dispatch(fetchMyRequests()); 
      } catch (error) {
        toast.error(error || 'Failed to submit deletion request');
      } finally {
        setCreateLoading(false);
      }
    }
  };

  const getParentCategoryOptions = () => {
    return categories
      .filter(cat => cat && cat.id && cat.id !== editingCategory?.id)
      .map(cat => ({
        value: cat.id,
        label: cat.name
      }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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
      case 'category_add_request':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'category_update_request':
        return <Edit className="w-4 h-4 text-yellow-600" />;
      case 'category_delete_request':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <FolderOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'category_add_request':
        return 'Add Category';
      case 'category_update_request':
        return 'Update Category';
      case 'category_delete_request':
        return 'Delete Category';
      default:
        return 'Category Request';
    }
  };

  const categoryRequests = myRequests.filter(req => 
    ['category_add_request', 'category_update_request', 'category_delete_request'].includes(req.type)
  );

  if (categoriesLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">
            Submit requests to add, update, or delete categories. All requests will be reviewed by an administrator.
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Categories
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Requests ({categoryRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'categories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Categories</h2>
              <Button onClick={handleAddCategory} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Request New Category
              </Button>
            </div>

            {showCreateForm && (
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingCategory ? 'Request Category Update' : 'Request New Category'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Request Type
                      </label>
                      <Select
                        {...register('requestType', { required: 'Request type is required' })}
                        options={[
                          { value: 'category_add_request', label: 'Add Category' },
                          { value: 'category_update_request', label: 'Update Category' },
                          { value: 'category_delete_request', label: 'Delete Category' }
                        ]}
                        disabled={!!editingCategory}
                      />
                      {errors.requestType && (
                        <p className="text-red-500 text-sm mt-1">{errors.requestType.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name
                      </label>
                      <Input
                        {...register('name', { required: 'Category name is required' })}
                        placeholder="Enter category name"
                        disabled={requestType === 'category_delete_request'}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="Enter category description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={requestType === 'category_delete_request'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category
                      </label>
                      <Select
                        {...register('parentId')}
                        options={[
                          { value: '', label: 'No parent (Root category)' },
                          ...getParentCategoryOptions()
                        ]}
                        disabled={requestType === 'category_delete_request'}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('isVisible')}
                        type="checkbox"
                        id="isVisible"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={requestType === 'category_delete_request'}
                      />
                      <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
                        Visible to customers
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCategory(null);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoading} className="flex items-center">
                      {createLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const requestStatus = getCategoryRequestStatus(category.id);
                
                return (
                  <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <FolderOpen className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      
                      
                      
                      {category.parentId && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Parent:</span>
                          <span className="ml-2">
                            {categories.find(cat => cat.id === category.parentId)?.name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="flex-1"
                        disabled={requestStatus?.status === 'pending'}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {requestStatus?.status === 'pending' ? 'Request Pending' : 'Request Update'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={requestStatus?.status === 'pending'}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {requestStatus?.status === 'pending' ? 'Request Pending' : 'Request Delete'}
                      </Button>
                    </div>

                    {requestStatus?.status === 'rejected' && requestStatus.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Request Rejected</p>
                            <p className="text-xs text-red-700 mt-1">{requestStatus.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {categories.length === 0 && (
              <Card className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500 mb-4">Start by requesting your first category</p>
                <Button onClick={handleAddCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Category
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">My Category Requests</h2>
            
            {categoryRequests.length > 0 ? (
              <div className="space-y-4">
                {categoryRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRequestTypeIcon(request.type)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {getRequestTypeLabel(request.type)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {request.type === 'category_add_request' && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">New Category Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Name:</span>
                              <p className="text-gray-900">{request.requestData?.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Parent:</span>
                              <p className="text-gray-900">
                                {request.requestData?.parentId 
                                  ? categories.find(cat => cat.id === request.requestData.parentId)?.name || 'Unknown'
                                  : 'Root Category'
                                }
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-600">Description:</span>
                              <p className="text-gray-900">{request.requestData?.description || 'No description'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.type === 'category_update_request' && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Update Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Category:</span>
                              <p className="text-gray-900">{request.requestData?.originalCategory?.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">New Name:</span>
                              <p className="text-gray-900">{request.requestData?.name}</p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-600">New Description:</span>
                              <p className="text-gray-900">{request.requestData?.description || 'No description'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.type === 'category_delete_request' && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Deletion Details</h4>
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">Category to Delete:</span>
                            <p className="text-gray-900">{request.requestData?.originalCategory?.name}</p>
                          </div>
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason</h4>
                          <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-500 mb-4">You haven&apos;t submitted any category requests yet</p>
                <Button onClick={() => setActiveTab('categories')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryRequestPage; 
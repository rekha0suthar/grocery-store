import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const AdminCategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const onSubmit = async (data) => {
    setCreateLoading(true);
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, categoryData: data })).unwrap();
        toast.success('Category updated successfully!');
        setEditingCategory(null);
      } else {
        await dispatch(createCategory(data)).unwrap();
        toast.success('Category created successfully!');
        setShowCreateForm(false);
      }
      reset();
      dispatch(fetchCategories());
    } catch (error) {
      toast.error(error || 'Failed to save category');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowCreateForm(true);
    reset({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
    });
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        toast.success('Category deleted successfully!');
        dispatch(fetchCategories());
      } catch (error) {
        toast.error(error || 'Failed to delete category');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCategory(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Category Name"
                type="text"
                placeholder="Enter category name"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Category name is required',
                })}
              />

              <Input
                label="Description"
                type="text"
                placeholder="Enter category description"
                error={errors.description?.message}
                {...register('description', {
                  required: 'Description is required',
                })}
              />

              <Input
                label="Parent Category ID (optional)"
                type="text"
                placeholder="Enter parent category ID"
                error={errors.parentId?.message}
                {...register('parentId')}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={createLoading}
                  className="flex-1"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>
              
              {category.parent && (
                <div className="mb-4">
                  <span className="text-xs text-gray-500">Parent: </span>
                  <span className="text-xs text-gray-700">{category.parent.name}</span>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500">Start by adding your first category</p>
        </Card>
      )}
    </div>
  );
};

export default AdminCategoriesPage;

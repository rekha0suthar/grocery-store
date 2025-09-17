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
import Select from '../../components/UI/Select.jsx';

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
        setShowCreateForm(false);
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
    // Use setTimeout to ensure the form is reset after state updates
    setTimeout(() => {
      reset({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
      });
    }, 0);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCreateForm(true);
    // Use setTimeout to ensure the form is reset after state updates
    setTimeout(() => {
      reset({
        name: '',
        description: '',
        parentId: '',
      });
    }, 0);
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

  const getParentCategoryOptions = () => {
    return categories
      .filter(cat => cat && cat.id && cat.id !== editingCategory?.id)
      .map(cat => ({
        value: cat.id,
        label: cat.name
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Categories</h1>
            <p className="text-gray-600 mt-2 text-lg">Organize your products into categories</p>
          </div>
          
          <Button
            onClick={handleAddCategory}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Category Name"
                    type="text"
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Category name is required',
                      minLength: {
                        value: 2,
                        message: 'Category name must be at least 2 characters',
                      },
                    })}
                  />

                  <Select
                    label="Parent Category (Optional)"
                    options={[
                      { value: '', label: 'No Parent (Root Category)' },
                      ...getParentCategoryOptions(),
                    ]}
                    {...register('parentId')}
                  />
                </div>

                <Input
                  label="Description"
                  type="text"
                  error={errors.description?.message}
                  {...register('description')}
                />

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
                  <Button
                    type="submit"
                    loading={createLoading}
                    className="flex items-center"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <p className="text-gray-600 mb-2">{category.description || 'No description'}</p>
                {category.parent && (
                  <p className="text-sm text-gray-500">
                    Parent: {category.parent.name}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Products: {category.productCount || 0}</span>
                  <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category</p>
            <Button
              onClick={handleAddCategory}
              className="flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;

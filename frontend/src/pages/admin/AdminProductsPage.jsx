import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const AdminProductsPage = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const onSubmit = async (data) => {
    setCreateLoading(true);
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData: data })).unwrap();
        toast.success('Product updated successfully!');
        setEditingProduct(null);
      } else {
        await dispatch(createProduct(data)).unwrap();
        toast.success('Product created successfully!');
        setShowCreateForm(false);
      }
      reset();
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error || 'Failed to save product');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success('Product deleted successfully!');
        dispatch(fetchProducts());
      } catch (error) {
        toast.error(error || 'Failed to delete product');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600">Add, edit, or remove products from your store</p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  type="text"
                  placeholder="Enter product name"
                  error={errors.name?.message}
                  {...register('name', {
                    required: 'Product name is required',
                  })}
                />

                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 0.01,
                      message: 'Price must be greater than 0',
                    },
                  })}
                />
              </div>

              <Input
                label="Description"
                type="text"
                placeholder="Enter product description"
                error={errors.description?.message}
                {...register('description', {
                  required: 'Description is required',
                })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Stock Quantity"
                  type="number"
                  placeholder="0"
                  error={errors.stock?.message}
                  {...register('stock', {
                    required: 'Stock quantity is required',
                    min: {
                      value: 0,
                      message: 'Stock cannot be negative',
                    },
                  })}
                />

                <Input
                  label="Category ID"
                  type="text"
                  placeholder="Enter category ID"
                  error={errors.categoryId?.message}
                  {...register('categoryId', {
                    required: 'Category ID is required',
                  })}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={createLoading}
                  className="flex-1"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
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

      {/* Products List */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              
              <Card.Content>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Start by adding your first product</p>
        </Card>
      )}
    </div>
  );
};

export default AdminProductsPage;

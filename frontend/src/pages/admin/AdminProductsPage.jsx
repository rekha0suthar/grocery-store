import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import Select from '../../components/UI/Select.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Plus, Edit, Trash2, Package, X, Save, Grid, List, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { validateProduct, PRODUCT_RULES } from '../../utils/validation.js';

const AdminProductsPage = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      isActive: 'true',
      isFeatured: 'false',
      isVisible: 'true',
    }
  });

  const watchedFields = watch();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    console.log('Raw images input:', data.images);
    
    // Transform form data to proper types before validation
    const transformedData = {
      name: data.name?.trim() || '',
      sku: data.sku?.trim() || '',
      description: data.description?.trim() || '',
      price: data.price ? parseFloat(data.price) : 0,
      stock: data.stock ? parseInt(data.stock) : 0,
      minStock: data.minStock ? parseInt(data.minStock) : 0,
      maxStock: data.maxStock ? parseInt(data.maxStock) : 0,
      unit: data.unit?.trim() || '',
      status: data.isActive === 'true' ? 'active' : 'inactive',
      visibility: data.isVisible === 'true' ? 'visible' : 'hidden',
      categoryId: data.categoryId?.trim() || '',
      weight: data.weight ? parseFloat(data.weight) : null,
      barcode: data.barcode?.trim() || null,
      manufacturer: data.manufacturer?.trim() || null,
      countryOfOrigin: data.countryOfOrigin?.trim() || null,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      images: data.images ? data.images
        .split(',')
        .map(img => img.trim())
        .filter(img => img && img.length > 0) // Filter out empty strings
        : [],
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null
    };

    console.log('Processed images:', transformedData.images);

    // Validate using core validation
    const validation = validateProduct(transformedData);
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      Object.keys(validation.errors).forEach(field => {
        toast.error(`${field}: ${validation.errors[field]}`);
      });
      return;
    }
    setCreateLoading(true);
    try {
      // Process form data for API
      const productData = {
        ...transformedData,
        isActive: data.isActive === 'true',
        isFeatured: data.isFeatured === 'true',
        isVisible: data.isVisible === 'true',
        // Set addedBy to current user (you might want to get this from auth state)
        addedBy: 'current-user-id', // Replace with actual user ID
      };

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData })).unwrap();
        toast.success('Product updated successfully!');
        setEditingProduct(null);
        setShowCreateForm(false); // Close the form after successful update
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success('Product created successfully!');
        setShowCreateForm(false);
      }
      reset();
      dispatch(fetchProducts());
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error || 'Failed to save product');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (product) => {
    console.log('Edit clicked for product:', product);
    setEditingProduct(product);
    setShowCreateForm(true);
    reset({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      categoryId: product.categoryId || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      manufacturer: product.manufacturer || '',
      countryOfOrigin: product.countryOfOrigin || '',
      unit: product.unit || '',
      weight: product.weight || '',
      minStock: product.minStock || '',
      maxStock: product.maxStock || '',
      discountPrice: product.discountPrice || '',
      discountStartDate: product.discountStartDate || '',
      discountEndDate: product.discountEndDate || '',
      expiryDate: product.expiryDate || '',
      isActive: product.isActive?.toString() || 'true',
      isFeatured: product.isFeatured?.toString() || 'false',
      isVisible: product.isVisible?.toString() || 'true',
      tags: product.tags?.join(', ') || '',
      images: product.images?.join(', ') || '',
    });
  };

  const handleDelete = async (productId) => {
    console.log('Delete clicked for product ID:', productId);
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
    setShowAdvancedFields(false);
    reset();
  };

  const handleAddProduct = () => {
    console.log('Add product clicked');
    setShowCreateForm(true);
  };

  // Generate SKU helper function
  const generateSKU = (productName) => {
    if (!productName) return '';
    return productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8)
      .padEnd(8, 'X');
  };

  // Handle product name change for auto SKU generation
  const handleNameChange = (e) => {
    const value = e.target.value;
    const sku = generateSKU(value);
    setValue('sku', sku);
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 relative z-10">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>
          
          <Card.Content className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-blue-600">${product.price}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock} in stock
              </span>
            </div>
            
            <div className="flex gap-2 relative z-20">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEdit(product);
                }}
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
                className="flex-1 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 relative z-10">
          <div className="flex">
            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <Card.Content className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-blue-600">${product.price}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} in stock
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4 relative z-20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(product);
                    }}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card.Content>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pt-6 pl-6 pr-6 space-y-6 relative z-10" style={{ pointerEvents: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-1">Add, edit, or remove products from your store</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <Grid className="w-4 h-4" />
            </Button>
        <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <List className="w-4 h-4" />
        </Button>
          </div>
          
          <Button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            size="lg"
            style={{ pointerEvents: 'auto' }}
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <Card.Header className="bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Product Name *"
                  type="text"
                  placeholder="Enter product name"
                  error={errors.name?.message}
                  {...register('name', {
                    required: 'Product name is required',
                      minLength: { value: 2, message: 'Product name must be at least 2 characters' },
                      maxLength: { value: 255, message: 'Product name must be less than 255 characters' },
                      onChange: handleNameChange
                    })}
                  />

                  <div className="space-y-2">
                    <Input
                      label="SKU (Stock Keeping Unit) *"
                      type="text"
                      placeholder="e.g., APPLES001"
                      error={errors.sku?.message}
                      {...register('sku', {
                        required: 'SKU is required',
                        pattern: {
                          value: /^[A-Z0-9-]{3,20}$/,
                          message: 'SKU must be 3-20 uppercase letters/numbers/hyphens'
                        }
                      })}
                    />
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Unique identifier for inventory tracking</span>
                    </div>
                  </div>
                </div>

                <Input
                  label="Description *"
                  type="text"
                  placeholder="Enter product description"
                  error={errors.description?.message}
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                  })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Barcode"
                    type="text"
                    placeholder="e.g., 123456789012"
                    error={errors.barcode?.message}
                    {...register('barcode', {
                      pattern: {
                        value: /^[0-9]{8,14}$/,
                        message: 'Barcode must be 8-14 digits'
                      }
                    })}
                  />

                  <Select
                    label="Category *"
                    error={errors.categoryId?.message}
                    {...register('categoryId', {
                      required: 'Category is required',
                    })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pricing & Inventory</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Price ($) *"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register('price', {
                    required: 'Price is required',
                      min: { value: 0.01, message: 'Price must be greater than 0' },
                  })}
                />

              <Input
                    label="Discount Price ($)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.discountPrice?.message}
                    {...register('discountPrice', {
                      min: { value: 0, message: 'Discount price cannot be negative' },
                })}
              />

                <Input
                    label="Current Stock *"
                  type="number"
                  placeholder="0"
                  error={errors.stock?.message}
                  {...register('stock', {
                    required: 'Stock quantity is required',
                      min: { value: 0, message: 'Stock cannot be negative' },
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Minimum Stock"
                    type="number"
                    placeholder="0"
                    error={errors.minStock?.message}
                    {...register('minStock', {
                      min: { value: 0, message: 'Minimum stock cannot be negative' },
                  })}
                />

                <Input
                    label="Maximum Stock *"
                    type="number"
                    placeholder="1000"
                    error={errors.maxStock?.message}
                    {...register('maxStock', {
                      min: { value: 0, message: 'Maximum stock cannot be negative' },
                    })}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Product Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Manufacturer"
                    type="text"
                    placeholder="e.g., Organic Farms Co."
                    error={errors.manufacturer?.message}
                    {...register('manufacturer')}
                  />

                  <Input
                    label="Country of Origin"
                    type="text"
                    placeholder="e.g., USA"
                    error={errors.countryOfOrigin?.message}
                    {...register('countryOfOrigin')}
                  />

                  <div className="space-y-2">
                    <Select
                      label="Unit *"
                      error={errors.unit?.message}
                      {...register('unit', {
                        required: 'Unit is required'
                      })}
                    >
                      <option value="">Select a unit</option>
                      {PRODUCT_RULES.UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </Select>
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Unit of measurement</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Weight *"
                    type="number"
                    step="0.01"
                    placeholder="1.0"
                    error={errors.weight?.message}
                    {...register('weight', {
                      min: { value: 0, message: 'Weight cannot be negative' },
                  })}
                />

                  <Input
                    label="Tags (comma separated)"
                    type="text"
                    placeholder="organic, fresh, local"
                    error={errors.tags?.message}
                    {...register('tags', {
                      pattern: {
                        value: /^[a-zA-Z0-9\s,]+$/, // Allow letters, numbers, spaces, and commas
                        message: 'Tags must be comma-separated strings'
                      }
                    })}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex-1">Advanced Settings</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                    className="flex items-center gap-2"
                  >
                    {showAdvancedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showAdvancedFields ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>

                {showAdvancedFields && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="Discount Start Date"
                        type="date"
                        error={errors.discountStartDate?.message}
                        {...register('discountStartDate')}
                      />

                      <Input
                        label="Discount End Date"
                        type="date"
                        error={errors.discountEndDate?.message}
                        {...register('discountEndDate')}
                      />

                      <Input
                        label="Expiry Date"
                        type="date"
                        error={errors.expiryDate?.message}
                        {...register('expiryDate')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Select
                        label="Status"
                        {...register('isActive')}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>

                      <Select
                        label="Featured"
                        {...register('isFeatured')}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </Select>

                      <Select
                        label="Visible"
                        {...register('isVisible')}
                      >
                        <option value="true">Visible</option>
                        <option value="false">Hidden</option>
                      </Select>
                    </div>

                    <Input
                      label="Product Images (comma separated URLs)"
                      type="text"
                      placeholder="https://example.com/image1.jpg, data:image/jpeg;base64,..."
                      error={errors.images?.message}
                      {...register('images', {
                        validate: (value) => {
                          if (!value) return true; // Optional field
                          const urls = value.split(',').map(url => url.trim()).filter(url => url && url.length > 0);
                          
                          // More flexible patterns
                          const urlPattern = /^https?:\/\/.+/;
                          const dataUrlPattern = /^data:image\/[a-zA-Z0-9]+;base64,.+/;
                          
                          const invalidUrls = urls.filter(url => {
                            // Check if it's a valid HTTP/HTTPS URL
                            if (urlPattern.test(url)) return false;
                            // Check if it's a valid data URL
                            if (dataUrlPattern.test(url)) return false;
                            // If neither pattern matches, it's invalid
                            return true;
                          });
                          
                          if (invalidUrls.length > 0) {
                            console.log('Invalid URLs found:', invalidUrls);
                            console.log('URL pattern test results:', urls.map(url => ({
                              url: url.substring(0, 50) + '...',
                              isHttpUrl: urlPattern.test(url),
                              isDataUrl: dataUrlPattern.test(url)
                            })));
                          }
                          
                          return invalidUrls.length === 0 || 'Each image must be a valid HTTP/HTTPS URL or data URL';
                        }
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  loading={createLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 cursor-pointer"
                  size="lg"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 cursor-pointer"
                  size="lg"
                  style={{ pointerEvents: 'auto' }}
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
        <div className="w-full">
          {viewMode === 'grid' ? <GridView /> : <ListView />}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Start by adding your first product to get started</p>
          <Button
            onClick={handleAddProduct}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AdminProductsPage;

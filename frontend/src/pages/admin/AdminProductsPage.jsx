import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import Input from '../../components/UI/Input.jsx';
import Select from '../../components/UI/Select.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Plus, Edit, Trash2, Package, X, Save, Grid, List, Info, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { PRODUCT_RULES } from '../../utils/validation.js';

function parseImagesField(value) {
  if (!value) return [];
  if (/^\s*\[/.test(value)) {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr)
        ? arr.map(String).map(s => s.trim()).filter(Boolean)
        : [];
    } catch {
      return []; 
    }
  }
  return value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

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
      name: '',
      sku: '',
      description: '',
      price: '',
      stock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      categoryId: '',
      weight: '',
      barcode: '',
      manufacturer: '',
      countryOfOrigin: '',
      tags: '',
      images: '',
      discountPrice: '',
      discountStartDate: '',
      discountEndDate: '',
      expiryDate: '',
      isActive: 'true',
      isFeatured: 'false',
      isVisible: 'true',
    }
  });

  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, products.length, categories.length]);

  const onSubmit = async (data) => {
    const imagesArray = data.images
      ? parseImagesField(data.images).filter(
        (img) =>
          PRODUCT_RULES.URL_PATTERN.test(img) ||
          PRODUCT_RULES.IMAGE_URL_PATTERN.test(img)
      )
      : [];

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
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      images: Array.from(new Set(imagesArray.map((u) => u.trim()))),
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null
    };

    setCreateLoading(true);
    try {
      const productData = {
        ...transformedData,
        isActive: data.isActive === 'true',
        isFeatured: data.isFeatured === 'true',
        isVisible: data.isVisible === 'true',
        addedBy: 'current-user-id',
      };

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData })).unwrap();
        toast.success('Product updated successfully!');
        setEditingProduct(null);
        setShowCreateForm(false);
      } else {
        await dispatch(createProduct(productData)).unwrap();
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

  const generateSKU = (productName) => {
    if (!productName) return '';
    return productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8)
      .padEnd(8, 'X');
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const sku = generateSKU(value);
    setValue('sku', sku, { shouldDirty: true, shouldValidate: true });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
    setShowAdvancedFields(false);
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
      discountStartDate: product.discountStartDate ? product.discountStartDate.substring(0, 10) : '',
      discountEndDate: product.discountEndDate ? product.discountEndDate.substring(0, 10) : '',
      expiryDate: product.expiryDate ? product.expiryDate.substring(0, 10) : '',
      isActive: product.isActive?.toString() || 'true',
      isFeatured: product.isFeatured?.toString() || 'false',
      isVisible: product.isVisible?.toString() || 'true',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      images: Array.isArray(product.images) ? product.images.join('\n') : (product.images || ''),
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
    setShowAdvancedFields(false);
    reset();
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowCreateForm(true);
    setShowAdvancedFields(false);
    reset({
      name: '',
      sku: '',
      description: '',
      price: '',
      stock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      categoryId: '',
      weight: '',
      barcode: '',
      manufacturer: '',
      countryOfOrigin: '',
      tags: '',
      images: '',
      discountPrice: '',
      discountStartDate: '',
      discountEndDate: '',
      expiryDate: '',
      isActive: 'true',
      isFeatured: 'false',
      isVisible: 'true',
    });
  };

  const getDiscountInfo = (product) => {
    if (product.discountPrice && product.discountPrice < product.price) {
      const discountPercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);
      return {
        hasDiscount: true,
        originalPrice: product.price,
        discountPrice: product.discountPrice,
        discountPercent
      };
    }
    return { hasDiscount: false };
  };

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const discountInfo = getDiscountInfo(product);
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 relative z-10 group">
            <div className="relative">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {discountInfo.hasDiscount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {discountInfo.discountPercent}% OFF
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock > 10
                  ? 'bg-green-100 text-green-800'
                  : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {product.stock} in stock
                </span>
              </div>
            </div>

            <Card.Content className="p-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {product.name || 'Unnamed Product'}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex">
                    <div className="flex items-center space-x-2">
                      {product.discountPrice && product.discountPrice < product.price ? (
                        <>
                          <span className="text-2xl font-bold text-gray-900">
                            ${product.discountPrice.toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {(product.weight || product.unit) && (
                      <span className="text-xs text-gray-500 mt-2 px-1">
                        per {product.weight || '1'} {product.unit || 'unit'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {product.description || 'No description available.'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    )}
                    {product.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-6">
      {products.map((product) => {
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 relative z-10">
            <div className="flex">
              <div className="w-32 bg-gray-100 flex items-center justify-center flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(product.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex">
                        <div className="flex items-center space-x-2">
                          {product.discountPrice && product.discountPrice < product.price ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">
                                ${product.discountPrice.toFixed(2)}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {(product.weight || product.unit) && (
                          <span className="text-xs text-gray-500 mt-2 px-1">
                            per {product.weight || '1'} {product.unit || 'unit'}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock > 10
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
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  if (loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const watchedImages = watch('images') || '';
  const previewImages = parseImagesField(watchedImages);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8 relative z-10" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-2 text-lg">Add, edit, or remove products from your store</p>
          </div>
          <div className="flex items-center gap-4">
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
            <Card.Content className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <input type="hidden" {...register('images')} />

                <div className="space-y-8">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <div className="space-y-8">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">Pricing & Inventory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <div className="space-y-8">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">Product Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                          value: /^[a-zA-Z0-9\s,]+$/,
                          message: 'Tags must be comma-separated strings'
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 flex-1">Advanced Settings</h4>
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
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Select label="Status" {...register('isActive')}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </Select>

                        <Select label="Featured" {...register('isFeatured')}>
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </Select>

                        <Select label="Visible" {...register('isVisible')}>
                          <option value="true">Visible</option>
                          <option value="false">Hidden</option>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const readers = files.map(
                              (file) =>
                                new Promise((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => resolve(String(ev.target.result));
                                  reader.readAsDataURL(file);
                                })
                            );
                            Promise.all(readers).then((base64Images) => {
                              const current = parseImagesField(watch('images'));
                              const next = [...current, ...base64Images].join('\n');
                              setValue('images', next, { shouldDirty: true, shouldValidate: true });
                            });
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        <textarea
                          rows={4}
                          placeholder="Paste one image URL or data URL per line"
                          value={watchedImages}
                          onChange={(e) => setValue('images', e.target.value, { shouldDirty: true, shouldValidate: true })}
                          className="mt-2 w-full rounded border border-gray-300 p-2 text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          One image per line. Supports http/https and data:image/...;base64,...
                        </p>

                        {previewImages && previewImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {previewImages && previewImages.map((img, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={img}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover rounded"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.opacity = '0.3';
                                    e.currentTarget.title = 'Failed to load';
                                  }}
                                  title={img}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const kept = previewImages && previewImages.filter((_, i) => i !== index) || [];
                                    setValue('images', kept.join('\n'), { shouldDirty: true, shouldValidate: true });
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-6 pt-8 border-t border-gray-200">
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

        {products.length > 0 ? (
          <div className="w-full">
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </div>
        ) : (
          <Card className="p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-500 mb-8 text-lg">Start by adding your first product to get started</p>
            <Button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              size="lg"
              style={{ pointerEvents: 'auto' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};


export default AdminProductsPage;

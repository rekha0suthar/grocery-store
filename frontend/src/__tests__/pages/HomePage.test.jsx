import React from 'react';
import { screen } from '@testing-library/react';
import HomePage from '../../pages/HomePage.jsx';
import { renderWithProviders, createMockState } from '../utils/test-utils.js';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams()],
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      price: 10.99,
      description: 'A test product',
      category: 'test-category',
      stock: 100,
      images: ['https://example.com/image.jpg'],
      isActive: true,
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Test Product 2',
      price: 15.99,
      description: 'Another test product',
      category: 'test-category',
      stock: 50,
      images: ['https://example.com/image2.jpg'],
      isActive: true,
      isFeatured: false,
    },
  ];

  const mockCategories = [
    {
      id: '1',
      name: 'Test Category 1',
      description: 'A test category',
      isActive: true,
    },
    {
      id: '2',
      name: 'Test Category 2',
      description: 'Another test category',
      isActive: true,
    },
  ];

  it('renders hero section with main heading', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Fresh Groceries/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivered to Your Door/i)).toBeInTheDocument();
  });

  it('shows hero section description', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getAllByText((content, element) => { return element.textContent.includes("Shop the freshest produce, organic foods, and household essentials") })[0]).toBeInTheDocument();
  });

  it('shows shop now and get started buttons', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Shop Now/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });

  it('shows features section headings', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText("Free Delivery")).toBeInTheDocument();
    expect(screen.getByText("Fresh Guarantee")).toBeInTheDocument();
    expect(screen.getByText("24/7 Support")).toBeInTheDocument();
    expect(screen.getByText("24/7 Support")).toBeInTheDocument();
  });

  it('shows features descriptions', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText((content, element) => { return element.textContent === "Free delivery on orders over $50. Fast and reliable service." })).toBeInTheDocument();
    expect(screen.getByText((content, element) => { return element.textContent === "100% fresh products or your money back. Quality guaranteed." })).toBeInTheDocument();
    expect(screen.getByText((content, element) => { return element.textContent === "Round-the-clock customer support for all your needs." })).toBeInTheDocument();
  });

  it('shows categories section', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Shop by Category/i)).toBeInTheDocument();
  });

  it('shows featured products section', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();
  });

  it('shows view all button in featured products section', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/View All/i)).toBeInTheDocument();
  });

  it('shows newsletter signup section', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Stay Updated/i)).toBeInTheDocument();
  });

  it('shows newsletter email input and subscribe button', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Subscribe/i)).toBeInTheDocument();
  });

  it('shows loading spinner when products are loading', () => {
    const initialState = createMockState({
      products: {
        products: [],
        loading: true,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        categories: mockCategories,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getAllByLabelText("Loading")[0]).toBeInTheDocument()
  });

  it('shows loading spinner when categories are loading', () => {
    const initialState = createMockState({
      products: {
        products: mockProducts,
        loading: false,
        error: null,
        filters: {
          category: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      },
      categories: {
        products: [],
        loading: true,
        error: null,
      },
    });
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getAllByLabelText("Loading")[0]).toBeInTheDocument()
  });
});

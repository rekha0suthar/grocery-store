import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/UI/LoadingSpinner.jsx';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('w-6 h-6'); // default size
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('w-4 h-4');

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('w-6 h-6');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('w-8 h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('w-12 h-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('custom-class');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});

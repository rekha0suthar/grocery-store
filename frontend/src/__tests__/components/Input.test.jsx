import { render, screen } from "@testing-library/react";
import React from 'react';
import userEvent from '@testing-library/user-event';
import Input from '../../components/UI/Input.jsx';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm');
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    // The label is not associated with the input via htmlFor, so we test it exists
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test input');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test input');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error message" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders with different types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('passes through other props', () => {
    render(<Input data-testid="test-input" name="testName" />);
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('name', 'testName');
  });

  it('shows helper text when provided', () => {
    render(<Input helperText="This is helpful information" />);
    
    expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    expect(screen.getByText('This is helpful information')).toHaveClass('text-gray-500');
  });

  it('shows helper text only when no error is present', () => {
    render(<Input helperText="Helper text" error="Error message" />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<Input label="Test Label" required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });
});

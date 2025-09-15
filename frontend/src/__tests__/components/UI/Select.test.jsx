import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from '../../../components/UI/Select.jsx';

describe('Select', () => {
  const defaultProps = {
    label: 'Test Label',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ],
    value: '',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders select with label', () => {
    render(<Select {...defaultProps} />);

    expect(screen.getByText(/test label/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select {...defaultProps} />);

    expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    expect(screen.getByText(/option 2/i)).toBeInTheDocument();
    expect(screen.getByText(/option 3/i)).toBeInTheDocument();
  });

  it('shows placeholder when no value is selected', () => {
    render(<Select {...defaultProps} placeholder="Select an option" />);

    expect(screen.getByText(/select an option/i)).toBeInTheDocument();
  });

  it('shows selected value', () => {
    render(<Select {...defaultProps} value="option2" />);

    expect(screen.getByDisplayValue(/option 2/i)).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    render(<Select {...defaultProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('option2');
  });

  it('shows error message when error is provided', () => {
    render(<Select {...defaultProps} error="This field is required" />);

    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Select {...defaultProps} required />);

    expect(screen.getByText(/\*/)).toBeInTheDocument();
  });

  it('disables select when disabled', () => {
    render(<Select {...defaultProps} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('shows help text when provided', () => {
    render(<Select {...defaultProps} helpText="This is help text" />);

    expect(screen.getByText(/this is help text/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Select {...defaultProps} className="custom-class" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('applies error styling when error is present', () => {
    render(<Select {...defaultProps} error="Error message" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('applies disabled styling when disabled', () => {
    render(<Select {...defaultProps} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('handles empty options array', () => {
    render(<Select {...defaultProps} options={[]} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles options with different value types', () => {
    const options = [
      { value: 1, label: 'Number 1' },
      { value: 'string', label: 'String Value' },
      { value: true, label: 'Boolean Value' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/number 1/i)).toBeInTheDocument();
    expect(screen.getByText(/string value/i)).toBeInTheDocument();
    expect(screen.getByText(/boolean value/i)).toBeInTheDocument();
  });

  it('handles options with empty labels', () => {
    const options = [
      { value: 'option1', label: '' },
      { value: 'option2', label: 'Option 2' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/option 2/i)).toBeInTheDocument();
  });

  it('handles options with null values', () => {
    const options = [
      { value: null, label: 'None' },
      { value: 'option1', label: 'Option 1' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/none/i)).toBeInTheDocument();
    expect(screen.getByText(/option 1/i)).toBeInTheDocument();
  });

  it('handles options with undefined values', () => {
    const options = [
      { value: undefined, label: 'Undefined' },
      { value: 'option1', label: 'Option 1' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/undefined/i)).toBeInTheDocument();
    expect(screen.getByText(/option 1/i)).toBeInTheDocument();
  });

  it('handles options with special characters', () => {
    const options = [
      { value: 'option1', label: 'Option & 1' },
      { value: 'option2', label: 'Option < 2' },
      { value: 'option3', label: 'Option > 3' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/option & 1/i)).toBeInTheDocument();
    expect(screen.getByText(/option < 2/i)).toBeInTheDocument();
    expect(screen.getByText(/option > 3/i)).toBeInTheDocument();
  });

  it('handles options with long labels', () => {
    const options = [
      { value: 'option1', label: 'This is a very long option label that should be handled properly' },
      { value: 'option2', label: 'Short' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/this is a very long option label that should be handled properly/i)).toBeInTheDocument();
    expect(screen.getByText(/short/i)).toBeInTheDocument();
  });

  it('handles options with numeric labels', () => {
    const options = [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles options with boolean labels', () => {
    const options = [
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/true/i)).toBeInTheDocument();
    expect(screen.getByText(/false/i)).toBeInTheDocument();
  });

  it('handles options with object labels', () => {
    const options = [
      { value: 'option1', label: { toString: () => 'Object Label 1' } },
      { value: 'option2', label: { toString: () => 'Object Label 2' } }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/object label 1/i)).toBeInTheDocument();
    expect(screen.getByText(/object label 2/i)).toBeInTheDocument();
  });

  it('handles options with function labels', () => {
    const options = [
      { value: 'option1', label: () => 'Function Label 1' },
      { value: 'option2', label: () => 'Function Label 2' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/function label 1/i)).toBeInTheDocument();
    expect(screen.getByText(/function label 2/i)).toBeInTheDocument();
  });

  it('handles options with array labels', () => {
    const options = [
      { value: 'option1', label: ['Array', 'Label', '1'] },
      { value: 'option2', label: ['Array', 'Label', '2'] }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/array label 1/i)).toBeInTheDocument();
    expect(screen.getByText(/array label 2/i)).toBeInTheDocument();
  });

  it('handles options with null labels', () => {
    const options = [
      { value: 'option1', label: null },
      { value: 'option2', label: 'Option 2' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/option 2/i)).toBeInTheDocument();
  });

  it('handles options with undefined labels', () => {
    const options = [
      { value: 'option1', label: undefined },
      { value: 'option2', label: 'Option 2' }
    ];

    render(<Select {...defaultProps} options={options} />);

    expect(screen.getByText(/option 2/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = () => {
  return <div>Test Component</div>;
};

test('minimal test passes', () => {
  render(<TestComponent />);
  expect(screen.getByText('Test Component')).toBeInTheDocument();
});

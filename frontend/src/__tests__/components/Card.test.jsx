import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../../components/UI/Card.jsx';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white rounded-lg shadow-sm border border-gray-200');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom</Card>);
    
    const card = screen.getByText('Custom');
    expect(card).toHaveClass('custom-class');
  });

  it('passes through other props', () => {
    render(<Card data-testid="test-card" role="region">Test</Card>);
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    
    const card = screen.getByText('Clickable');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders CardHeader component', () => {
    render(
      <Card>
        <Card.Header>Header Content</Card.Header>
      </Card>
    );
    
    const header = screen.getByText('Header Content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('px-6 py-4 border-b border-gray-200');
  });

  it('renders CardContent component', () => {
    render(
      <Card>
        <Card.Content>Content</Card.Content>
      </Card>
    );
    
    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('px-6 py-4');
  });

  it('renders CardFooter component', () => {
    render(
      <Card>
        <Card.Footer>Footer Content</Card.Footer>
      </Card>
    );
    
    const footer = screen.getByText('Footer Content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('px-6 py-4 border-t border-gray-200');
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Content>Content</Card.Content>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusAlert from '../../../components/UI/StatusAlert.jsx';

describe('StatusAlert Component', () => {
  const mockRequest = {
    id: 'req-123',
    createdAt: '2023-01-01T00:00:00Z',
    adminNotes: 'Please provide additional documentation',
  };

  const mockProfile = {
    storeName: 'Test Store',
    storeAddress: '123 Main St, City, State',
  };

  it('renders with approved status', () => {
    const { container } = render(
      <StatusAlert 
        status="approved" 
        message="Your registration has been approved!" 
      />
    );
    
    expect(screen.getByText('Registration Approved')).toBeInTheDocument();
    expect(screen.getByText('Your registration has been approved!')).toBeInTheDocument();
    
    // Check for the SVG icon with correct class
    const svgIcon = container.querySelector('svg.text-green-500');
    expect(svgIcon).toBeInTheDocument();
  });

  it('renders with pending status', () => {
    const { container } = render(
      <StatusAlert 
        status="pending" 
        message="Your registration is under review" 
      />
    );
    
    expect(screen.getByText('Registration Pending')).toBeInTheDocument();
    expect(screen.getByText('Your registration is under review')).toBeInTheDocument();
    
    // Check for the SVG icon with correct class
    const svgIcon = container.querySelector('svg.text-yellow-500');
    expect(svgIcon).toBeInTheDocument();
  });

  it('renders with rejected status', () => {
    const { container } = render(
      <StatusAlert 
        status="rejected" 
        message="Your registration has been rejected" 
      />
    );
    
    expect(screen.getByText('Registration Rejected')).toBeInTheDocument();
    expect(screen.getByText('Your registration has been rejected')).toBeInTheDocument();
    
    // Check for the SVG icon with correct class
    const svgIcon = container.querySelector('svg.text-red-500');
    expect(svgIcon).toBeInTheDocument();
  });

  it('renders with default status', () => {
    const { container } = render(
      <StatusAlert 
        status="unknown" 
        message="Unknown status" 
      />
    );
    
    expect(screen.getByText('Registration Status')).toBeInTheDocument();
    expect(screen.getByText('Unknown status')).toBeInTheDocument();
    
    // Check for the SVG icon with correct class
    const svgIcon = container.querySelector('svg.text-gray-500');
    expect(svgIcon).toBeInTheDocument();
  });

  it('renders with request information', () => {
    render(
      <StatusAlert 
        status="pending" 
        message="Under review" 
        request={mockRequest}
      />
    );
    
    expect(screen.getByText(/Request ID:/)).toBeInTheDocument();
    expect(screen.getByText('req-123')).toBeInTheDocument();
    expect(screen.getByText(/Submitted:/)).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    expect(screen.getByText(/Admin Notes:/)).toBeInTheDocument();
    expect(screen.getByText('Please provide additional documentation')).toBeInTheDocument();
  });

  it('renders with profile information', () => {
    render(
      <StatusAlert 
        status="approved" 
        message="Approved" 
        profile={mockProfile}
      />
    );
    
    expect(screen.getByText(/Store Name:/)).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText(/Store Address:/)).toBeInTheDocument();
    expect(screen.getByText('123 Main St, City, State')).toBeInTheDocument();
  });

  it('renders with both request and profile information', () => {
    render(
      <StatusAlert 
        status="approved" 
        message="Approved with conditions" 
        request={mockRequest}
        profile={mockProfile}
      />
    );
    
    expect(screen.getByText(/Request ID:/)).toBeInTheDocument();
    expect(screen.getByText('req-123')).toBeInTheDocument();
    expect(screen.getByText(/Store Name:/)).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('applies correct CSS classes for approved status', () => {
    const { container } = render(
      <StatusAlert 
        status="approved" 
        message="Approved" 
      />
    );
    
    const alertDiv = container.firstChild;
    expect(alertDiv).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('applies correct CSS classes for pending status', () => {
    const { container } = render(
      <StatusAlert 
        status="pending" 
        message="Pending" 
      />
    );
    
    const alertDiv = container.firstChild;
    expect(alertDiv).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('applies correct CSS classes for rejected status', () => {
    const { container } = render(
      <StatusAlert 
        status="rejected" 
        message="Rejected" 
      />
    );
    
    const alertDiv = container.firstChild;
    expect(alertDiv).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('handles missing request adminNotes gracefully', () => {
    const requestWithoutNotes = {
      id: 'req-123',
      createdAt: '2023-01-01T00:00:00Z',
    };

    render(
      <StatusAlert 
        status="pending" 
        message="Under review" 
        request={requestWithoutNotes}
      />
    );
    
    expect(screen.getByText(/Request ID:/)).toBeInTheDocument();
    expect(screen.getByText('req-123')).toBeInTheDocument();
    expect(screen.queryByText(/Admin Notes:/)).not.toBeInTheDocument();
  });

  it('handles missing profile storeAddress gracefully', () => {
    const profileWithoutAddress = {
      storeName: 'Test Store',
    };

    render(
      <StatusAlert 
        status="approved" 
        message="Approved" 
        profile={profileWithoutAddress}
      />
    );
    
    expect(screen.getByText(/Store Name:/)).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.queryByText(/Store Address:/)).not.toBeInTheDocument();
  });
});

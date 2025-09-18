import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, FolderOpen } from 'lucide-react';

/**
 * DashboardHeader Component
 * 
 * A reusable header component for dashboard pages.
 * Follows Clean Architecture principles:
 * - Single Responsibility: Only handles header display and navigation
 * - Open/Closed: Extensible through props
 * - Interface Segregation: Clean props interface
 */
const DashboardHeader = ({
  userName,
  title,
  subtitle,
  primaryAction = {
    text: "Start Shopping",
    icon: ShoppingCart,
    path: "/products",
    className: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
  },
  secondaryAction = {
    text: "Browse Categories", 
    icon: FolderOpen,
    path: "/categories",
    className: "bg-green-600 hover:bg-green-700 focus:ring-green-500"
  },
  showActions = true
}) => {
  const navigate = useNavigate();

  const handleActionClick = (path) => {
    navigate(path);
  };

  const ActionButton = ({ action }) => {
    const IconComponent = action.icon;
    
    return (
      <button
        onClick={() => handleActionClick(action.path)}
        className={`inline-flex items-center px-4 py-2 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${action.className}`}
        style={{ 
          pointerEvents: 'auto', 
          position: 'relative',
        }}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {action.text}
      </button>
    );
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title || `Welcome back, ${userName || 'Customer'}!`}
            </h1>
            <p className="mt-2 text-gray-600">
              {subtitle || "Discover amazing products and start shopping"}
            </p>
          </div>
          {showActions && (
            <div className="flex space-x-3">
              <ActionButton action={primaryAction} />
              <ActionButton action={secondaryAction} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

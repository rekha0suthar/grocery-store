import React from 'react';
import { Package } from 'lucide-react';

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states with actions.
 * Follows Clean Architecture principles:
 * - Single Responsibility: Only handles empty state display
 * - Open/Closed: Extensible through props
 * - Dependency Inversion: Depends on abstractions (props)
 */
const EmptyState = ({
  icon: IconComponent = Package,
  title = "No Items Available",
  message = "There are currently no items to display. Please check back later.",
  actions = [],
  className = "text-center py-12"
}) => {
  return (
    <div className={className}>
      <IconComponent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      {actions.length > 0 && (
        <div className="flex justify-center space-x-4">
          {actions.map((action, index) => {
            const ActionIconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.className || 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}`}
              >
                {ActionIconComponent && <ActionIconComponent className="w-4 h-4 mr-2" />}
                {action.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

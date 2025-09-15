import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusAlert = ({ status, message, request, profile }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'approved':
        return 'Registration Approved';
      case 'pending':
        return 'Registration Pending';
      case 'rejected':
        return 'Registration Rejected';
      default:
        return 'Registration Status';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {getStatusTitle()}
          </h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            
            {request && (
              <div className="mt-3 space-y-2">
                <div className="text-xs">
                  <span className="font-medium">Request ID:</span> {request.id}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Submitted:</span> {new Date(request.createdAt).toLocaleDateString()}
                </div>
                {request.adminNotes && (
                  <div className="text-xs">
                    <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                  </div>
                )}
              </div>
            )}
            
            {profile && profile.storeName && (
              <div className="mt-3 space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Store Name:</span> {profile.storeName}
                </div>
                {profile.storeAddress && (
                  <div className="text-xs">
                    <span className="font-medium">Store Address:</span> {profile.storeAddress}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusAlert;

// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}
        ></div>
        <p className="mt-2 text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
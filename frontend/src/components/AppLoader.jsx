import React from 'react';
import { useSettings } from '../context/SettingsContext';

const AppLoader = () => {
  // Use optional chaining or defaults, as this might render before SettingsContext is fully ready or during its own loading state.
  const { restaurantInfo } = useSettings() || {};
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">Loading {restaurantInfo?.name || 'Savory'}...</p>
    </div>
  );
};

export default AppLoader;

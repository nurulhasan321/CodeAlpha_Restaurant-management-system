import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const AuthLayout = () => {
  const { restaurantInfo } = useSettings();
  const location = useLocation();
  const isRegister = location.pathname.includes('/register');
  const isForgot = location.pathname.includes('/forgot-password');
  const isReset = location.pathname.includes('/reset-password');
  
  let heading = "Sign in to your account";
  if (isRegister) heading = "Create an account";
  else if (isForgot) heading = "Reset your password";
  else if (isReset) heading = "Set new password";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center text-4xl font-bold text-primary tracking-tight">
          {restaurantInfo?.name || 'Savory'}
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {heading}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

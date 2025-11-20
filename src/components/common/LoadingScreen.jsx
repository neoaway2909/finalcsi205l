import React from 'react';

const LoadingScreen = ({ title = "กำลังโหลดระบบ...", subtitle = "โปรดรอสักครู่" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Logo/Branding */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-primary mb-2">Care yoursafe</h1>
          <p className="text-sm text-muted-foreground">online</p>
        </div>

        {/* Modern Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

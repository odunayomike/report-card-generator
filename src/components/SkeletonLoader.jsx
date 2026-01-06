import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 animate-pulse hidden lg:block">
        {/* Logo/Header */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-8">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6 lg:p-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkeletonLoader;

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-xl font-semibold">GuidAp</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-teal-600 text-white rounded">
            Réservation
          </button>
          <button className="text-gray-600">
            <span className="sr-only">Menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

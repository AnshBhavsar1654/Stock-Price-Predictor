import React from 'react';
import { FiHome, FiBarChart2, FiBriefcase } from 'react-icons/fi';
import stockLogo from './stock.png'; // Make sure to import the image properly

function Navbar() {
  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="cursor-pointer" onClick={() => navigateTo('/')}>
              <img className="h-8 w-auto" src={stockLogo} alt="Logo" />
            </span>
            <span className="ml-2 text-lg font-bold">Stock Predictor</span>
          </div>
          <div className="hidden md:flex items-center">
            <span className="mr-6 cursor-pointer" onClick={() => navigateTo('/predictor')}>
              <FiBarChart2 className="h-6 w-6" />
            </span>
            <span className="mr-6 cursor-pointer" onClick={() => navigateTo('/portfolio')}>
              <FiBriefcase className="h-6 w-6" />
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

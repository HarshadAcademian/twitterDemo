import React from 'react';
import { FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';

const Sidebar = ({ onLogout, onDeleteAccount }) => {
  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-6 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/academian-white.svg" // public folder root path
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            <FaSignOutAlt /> Logout
          </button>

          <button
            onClick={onDeleteAccount}
            className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            <FaTrashAlt /> Delete Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-center text-gray-400 mt-8">
        &copy; {new Date().getFullYear()} MyApp
      </div>
    </div>
  );
};

export default Sidebar;

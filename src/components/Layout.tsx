import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Bell, Settings, User, Rocket } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white p-1.5 rounded">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    Nbula
                  </span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-blue-500 text-gray-900'
                        : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-blue-500 text-gray-900'
                        : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Job Listings
                </NavLink>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}
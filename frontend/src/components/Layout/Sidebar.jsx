import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.js';
import { 
  Home, 
  Package, 
  FolderOpen, 
  User, 
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: FolderOpen },
    { name: 'My Requests', href: '/requests', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Settings },
    { name: 'Manage Products', href: '/admin/products', icon: Package },
    { name: 'Manage Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Manage Requests', href: '/admin/requests', icon: FileText },
  ];

  const isAdmin = user?.role === 'admin';
  const isStoreManager = user?.role === 'store_manager';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                  onClick={onClose}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Admin/Store Manager Navigation */}
          {(isAdmin || isStoreManager) && (
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-2 space-y-1">
                {adminNavigation
                  .filter(item => {
                    // Store managers can't manage categories
                    if (isStoreManager && item.href === '/admin/categories') {
                      return false;
                    }
                    return true;
                  })
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          )
                        }
                        onClick={onClose}
                      >
                        <Icon className="mr-3 w-5 h-5" />
                        {item.name}
                      </NavLink>
                    );
                  })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

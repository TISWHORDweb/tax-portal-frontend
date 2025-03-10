import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileDown, 
  Upload, 
  User, 
  Users, 
  FileText, 
  ClipboardList, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logo from './../../assets/img/logo.png';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userNavItems = [
    { path: '/user/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/user/templates', icon: <FileDown size={20} />, label: 'Download Templates' },
    { path: '/user/submit', icon: <Upload size={20} />, label: 'Submit Returns' },
    { path: '/user/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Manage Users' },
    { path: '/admin/templates', icon: <FileText size={20} />, label: 'Manage Templates' },
    { path: '/admin/submissions', icon: <ClipboardList size={20} />, label: 'Review Submissions' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-green-600">eFiling System</h1>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-green-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`mr-3 ${isActive(item.path) ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </div>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="px-2 mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut size={20} className="mr-3 text-red-400" />
                Logout
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-700 font-bold">
                <img src={logo} style={{width: 80, height: 40}} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">eFiling Syetem</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-gray-800 bg-opacity-75">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-30">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
                <h1 className="text-xl font-bold text-green-600">eFiling Syetem</h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-green-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`mr-4 ${isActive(item.path) ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-700 font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                      <p className="text-xs font-medium text-gray-500">{user?.role}</p>
                    </div>
                  </div>
                </div>
                <div className="px-2 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3 text-red-400" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pt-16 md:pt-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
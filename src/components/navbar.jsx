import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { MoonIcon, SunIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import { useAuth } from '@/contexts/AuthContext'; 
export const useMode = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newMode);
    setMode(newMode);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return { mode, toggleMode };
};

const Navbar = () => {
  const { mode, toggleMode } = useMode();
  const { user, logout, isLoggedIn, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

 
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const DEFAULT_AVATAR_URL = `https://placehold.co/256x256/A855F7/ffffff?text=${userInitial}`;
  
 
  const avatarSource = user?.avatar || DEFAULT_AVATAR_URL;


  
  const getNavigationLinks = () => {
    if (!isLoggedIn || !user) return [];

    
    let links = [
      { name: 'Projects', href: '/projects' },
      { name: 'Teams', href: '/teams' },
      { name: 'Files', href: '/files' },
      { name: 'Chat', href: '/chat' },
      { name: 'Rules', href: '/rules', requiredRole: 'Admin' }, 
      { name: 'Analytics', href: '/analytics', excludeRole: 'Admin' },
    ];

   
    links = links.filter(link => {
     
      if (link.requiredRole && user.role !== link.requiredRole) {
        return false;
      }
    if (link.excludeRole && user.role === link.excludeRole) {
        return false;
      }
      return true;
    });
    
 
    if (user.role === 'Admin') {
      return [{ name: 'Dashboard', href: '/dashboard' }, ...links];
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (href) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

 
  if (loading) {
    return (
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex shrink-0 items-center">
              <span className="text-xl font-bold text-white">Opsync</span>
            </div>
            <div className="text-sm text-gray-300">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          
         
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>

        
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
              >
                Opsync
              </button>
            </div>
            
           
            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigationLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleNavigation(link.href)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        location.pathname === link.href 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
                
              </div>
            )}
          </div>

         
          <div className="absolute inset-y-0 right-0 flex items-center gap-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

           
            <Menu as="div" className="relative">
              <MenuButton className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                {mode === 'dark' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white text-gray-800 shadow-lg py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={toggleMode}
                      className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                    >
                      {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

           
            {isLoggedIn ? (
              <Menu as="div" className="relative">
                <MenuButton className="flex rounded-full focus:outline-none">
                  <img
                    src={avatarSource}
                    alt={`${user?.name || 'User'} avatar`}
                    className="h-8 w-8 rounded-full bg-gray-800 outline outline-1 -outline-offset-1 outline-white/10"
                  />
                </MenuButton>

                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                 
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-300 ${active ? 'bg-white/5' : ''}`}
                      >
                        Your Profile
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => handleNavigation('/settings')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-300 ${active ? 'bg-white/5' : ''}`}
                      >
                        Settings
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-300 ${active ? 'bg-white/5' : ''}`}
                      >
                        Sign out
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {mobileMenuOpen && isLoggedIn && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigationLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  location.pathname === link.href 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
           
            <button
              onClick={() => handleNavigation('/profile')}
              className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium transition-colors ${
                location.pathname === '/profile' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

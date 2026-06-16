import { useState, useContext, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!token || !user) return null;

  const avatarUrl = user?.profile_picture 
    ? `http://localhost:8000${user.profile_picture}` 
    : null;
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Shared function to style navigation links dynamically based on active state
  const navLinkStyles = ({ isActive }) =>
    isActive
      ? "bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all border border-blue-100"
      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all";

  return (
    <nav className="bg-white shadow-sm border-b fixed w-full top-0 z-50 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left side: Logo & Navigation Links */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight mr-8">
              ExpenseTracker
            </Link>
            
            <div className="hidden md:flex md:space-x-2">
              <NavLink to="/" className={navLinkStyles}>
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={navLinkStyles}>
                Transactions
              </NavLink>
            </div>
          </div>

          {/* Right side: Profile Avatar & Dropdown */}
          <div className="flex items-center relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition overflow-hidden border-2 border-white shadow-sm"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>

            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 top-14 mt-2 w-56 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                </div>
                
                {/* Removed the Profile Settings Link from here */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    Sign out
                  </button>
                </div>
                
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
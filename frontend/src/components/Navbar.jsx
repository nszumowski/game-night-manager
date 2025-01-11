import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/die-icon.png" alt="Game Night Manager Logo" className="h-8 w-8 mr-2" />
              <span className="text-white hover:text-gray-300 whitespace-nowrap text-lg font-bold mr-4">Game Night Manager</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white hover:text-gray-300 focus:outline-none"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:justify-between md:flex-1 md:ml-4">
              {/* Left side navigation */}
              <ul className="flex space-x-4 list-none p-0">
                {isLoggedIn && <li><Link to="/games" className="text-white hover:text-gray-300">Games</Link></li>}
                {isLoggedIn && <li><Link to="/friends" className="text-white hover:text-gray-300">Friends</Link></li>}
                {isLoggedIn && <li><Link to="/game-nights" className="text-white hover:text-gray-300">Game Nights</Link></li>}
              </ul>

              {/* Right side navigation */}
              <ul className="flex space-x-4 list-none p-0">
                {isLoggedIn && <li><Link to="/profile" className="text-white hover:text-gray-300">Profile</Link></li>}
                {!isLoggedIn && <li><Link to="/login" className="text-white hover:text-gray-300">Login</Link></li>}
                {!isLoggedIn && <li><Link to="/register" className="text-white hover:text-gray-300">Register</Link></li>}
                {isLoggedIn && <li><Link to="/logout" className="text-white hover:text-gray-300">Logout</Link></li>}
              </ul>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
            <ul className="flex flex-col space-y-2">
              {isLoggedIn && (
                <>
                  <li><Link to="/games" className="block text-white hover:text-gray-300 py-2">Games</Link></li>
                  <li><Link to="/friends" className="block text-white hover:text-gray-300 py-2">Friends</Link></li>
                  <li><Link to="/game-nights" className="block text-white hover:text-gray-300 py-2">Game Nights</Link></li>
                  <li><Link to="/profile" className="block text-white hover:text-gray-300 py-2">Profile</Link></li>
                  <li><Link to="/logout" className="block text-white hover:text-gray-300 py-2">Logout</Link></li>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <li><Link to="/login" className="block text-white hover:text-gray-300 py-2">Login</Link></li>
                  <li><Link to="/register" className="block text-white hover:text-gray-300 py-2">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
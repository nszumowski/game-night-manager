import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src="/die-icon.png" alt="Game Night Manager Logo" className="h-8 w-8 mr-2" />
          <span className="text-white hover:text-gray-300 whitespace-nowrap">Game Night Manager</span>
        </Link>
        {/* Left side navigation */}
        <ul className="flex space-x-4 list-none p-0">
          {/* <li><Link to="/" className="text-white hover:text-gray-300">Home</Link></li> */}
          {isLoggedIn && <li><Link to="/games" className="text-white hover:text-gray-300">Games</Link></li>}
          {isLoggedIn && <li><Link to="/friends" className="text-white hover:text-gray-300">Friends</Link></li>}
        </ul>

        {/* Right side navigation */}
        <ul className="flex space-x-4 list-none p-0">
          {isLoggedIn && <li><Link to="/profile" className="text-white hover:text-gray-300">Profile</Link></li>}
          {!isLoggedIn && <li><Link to="/login" className="text-white hover:text-gray-300">Login</Link></li>}
          {!isLoggedIn && <li><Link to="/register" className="text-white hover:text-gray-300">Register</Link></li>}
          {isLoggedIn && <li><Link to="/logout" className="text-white hover:text-gray-300">Logout</Link></li>}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
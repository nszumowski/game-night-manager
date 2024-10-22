import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4 list-none p-0">
        <li><Link to="/" className="text-white">Home</Link></li>
        {!isLoggedIn && <li><Link to="/login" className="text-white">Login</Link></li>}
        {!isLoggedIn && <li><Link to="/register" className="text-white">Register</Link></li>}
        {isLoggedIn && <li><Link to="/games" className="text-white">Games</Link></li>}
        {isLoggedIn && <li><Link to="/profile" className="text-white">Profile</Link></li>}
        {isLoggedIn && <li><Link to="/logout" className="text-white">Logout</Link></li>}
      </ul>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('jwtToken'); // Check if the token is present

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {!isLoggedIn && <li><Link to="/login">Login</Link></li>}
        {!isLoggedIn && <li><Link to="/register">Register</Link></li>}
        <li><Link to="/game-night/1">Game Night</Link></li>
        {isLoggedIn && <li><Link to="/profile">Profile</Link></li>} {/* Conditionally render the profile link */}
        {isLoggedIn && <li><Link to="/logout">Logout</Link></li>} {/* Conditionally render the logout link */}
      </ul>
    </nav>
  );
};

export default Navbar;
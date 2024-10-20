import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {!isLoggedIn && <li><Link to="/login">Login</Link></li>}
        {!isLoggedIn && <li><Link to="/register">Register</Link></li>}
        {isLoggedIn && <li><Link to="/games">Games</Link></li>}
        {isLoggedIn && <li><Link to="/profile">Profile</Link></li>}
        {isLoggedIn && <li><Link to="/logout">Logout</Link></li>}
      </ul>
    </nav>
  );
};

export default Navbar;
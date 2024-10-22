import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Logout = ({ setIsLoggedIn }) => {
  const history = useHistory();

  useEffect(() => {
    // Remove the JWT token from local storage
    localStorage.removeItem('jwtToken');

    // Update the application state to reflect that the user is logged out
    setIsLoggedIn(false);

    // Redirect the user to the home page
    history.push('/');
  }, [history, setIsLoggedIn]);

  return null;
};

export default Logout;
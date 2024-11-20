import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  const history = useHistory();

  useEffect(() => {
    logout();
    history.push('/');
  }, [history, logout]);

  return null;
};

export default Logout;
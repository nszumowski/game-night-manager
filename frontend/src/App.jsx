// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameNight from './pages/GameNight';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Games from './pages/Games';
import Friends from './pages/Friends';
import Navbar from './components/Navbar';
import { verifyToken } from './utils/api';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('jwtToken') !== null;
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const isValid = await verifyToken();
        if (!isValid) {
          localStorage.removeItem('jwtToken');
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(true);
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="font-sans">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Switch>
          <Route path="/login">
            <Login setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path="/register" component={Register} />
          <Route path="/logout">
            <Logout setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <PrivateRoute path="/game-night/:id" component={GameNight} />
          <PrivateRoute path="/games" component={Games} />
          <PrivateRoute path="/friends" component={Friends} />
          <PrivateRoute path="/profile" component={Profile} />
          <Route path="/" exact component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
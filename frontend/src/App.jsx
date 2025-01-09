// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameNights from './pages/GameNights';
import GameNightDetails from './pages/GameNightDetails';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Games from './pages/Games';
import Friends from './pages/Friends';
import Navbar from './components/Navbar';
import { verifyToken } from './utils/api';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/Notification';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="font-sans">
            <Navbar />
            <Notification />
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/logout" component={Logout} />
              <PrivateRoute path="/game-nights" exact component={GameNights} />
              <PrivateRoute path="/game-nights/:id" component={GameNightDetails} />
              <PrivateRoute path="/games" component={Games} />
              <PrivateRoute path="/friends" component={Friends} />
              <PrivateRoute path="/profile/:userId?" component={Profile} />
              <Route path="/" exact component={Home} />
              <Route exact path="/forgot-password" component={ForgotPassword} />
              <Route exact path="/reset-password/:token" component={ResetPassword} />
            </Switch>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
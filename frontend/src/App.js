// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameNight from './pages/GameNight';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Navbar from './components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by verifying the presence of the JWT token
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div>
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login">
            <Login setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path="/register" component={Register} />
          <Route path="/game-night/:id" component={GameNight} />
          <Route path="/profile" component={Profile} />
          <Route path="/logout">
            <Logout setIsLoggedIn={setIsLoggedIn} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
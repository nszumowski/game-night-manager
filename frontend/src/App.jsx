// src/App.js
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
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
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/Notification';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        path: "/game-nights",
        element: <PrivateRoute><GameNights /></PrivateRoute>
      },
      {
        path: "/game-nights/:id",
        element: <PrivateRoute><GameNightDetails /></PrivateRoute>
      },
      {
        path: "/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
      },
      {
        path: "/games",
        element: <PrivateRoute><Games /></PrivateRoute>
      },
      {
        path: "/friends",
        element: <PrivateRoute><Friends /></PrivateRoute>
      },
      {
        path: "/logout",
        element: <PrivateRoute><Logout /></PrivateRoute>
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <Notification />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
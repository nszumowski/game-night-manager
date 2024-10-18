import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://192.168.0.132:5000/api/users/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('jwtToken', response.data.token); // Store the token
        history.push('/profile'); // Redirect to profile
      }
    } catch (error) {
      console.error('There was an error logging in the user!', error);
    }
  };

  return (
    <div>
      <h1>Login to Game Night Manager</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.132:5000/api/users/register', { name, email, password });
      if (response.data.success) {
        localStorage.setItem('jwtToken', response.data.token); // Store the token in local storage
        history.push('/profile');
      }
    } catch (error) {
      console.error('There was an error registering the user!', error);
    }
  };

  return (
    <div>
      <h1>Register for Game Night Manager</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autocomplete="name" />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autocomplete="email" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autocomplete="new-password" />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autocomplete="new-password" />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
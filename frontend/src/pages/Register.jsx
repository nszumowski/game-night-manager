import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PasswordValidationForm from '../components/PasswordValidationForm';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    console.log('handleSubmit called');
    
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const sanitizedName = name.trim();
      if (sanitizedName.length < 1 || sanitizedName.length > 50) {
        console.log('Name validation failed');
        setError('Name must be between 1 and 50 characters');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        console.log('Password validation failed');
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      console.log('Registration payload:', {
        name: sanitizedName,
        email,
        password: password.length
      });

      const response = await api.post('/users/register', {
        name: sanitizedName,
        email,
        password
      });

      if (response.data.success) {
        showNotification('Registration successful!', 'success');
        await login(email, password);
        history.push('/profile');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed');
      showNotification('Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register for Game Night Manager</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            autoComplete="name"
            className="border p-2 rounded w-full"
            aria-label="Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="border p-2 rounded w-full"
            aria-label="Email"
          />
        </div>
        <PasswordValidationForm
          newPassword={password}
          confirmPassword={confirmPassword}
          showCurrentPassword={false}
          onPasswordChange={(e) => {
            const { name, value } = e.target;
            if (name === 'newPassword') setPassword(value);
            if (name === 'confirmPassword') setConfirmPassword(value);
          }}
          onSubmit={handleSubmit}
          submitButtonText="Register"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default Register;
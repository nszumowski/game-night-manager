import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Get the token from local storage
        if (!token) {
          throw new Error('No token found');
        }
        const response = await axios.get('http://192.168.0.133:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the headers
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('There was an error fetching the user profile!', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-700">Name: {user.name}</p>
      <p className="text-gray-700">Email: {user.email}</p>
      <p className="text-gray-700">Date Registered: {new Date(user.date).toLocaleDateString()}</p>
    </div>
  );
};

export default Profile;
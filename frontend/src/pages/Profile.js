import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Get the token from local storage
        if (!token) {
          console.log('No token found');
          throw new Error('No token found');
        }
        const response = await axios.get('http://192.168.0.132:5000/api/users/profile', {
          headers: {
            Authorization: token // Include the token in the headers
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Date Registered: {new Date(user.date).toLocaleDateString()}</p>
    </div>
  );
};

export default Profile;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [ownedGames, setOwnedGames] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get('http://192.168.0.133:5000/api/users/profile', {
        headers: {
          Authorization: token
        }
      });
      setUser(response.data);
      setOwnedGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('There was an error fetching the user profile!', error);
    }
  };

  const removeGame = async (gameId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.post('http://192.168.0.133:5000/api/users/remove-owned-game', 
        { gameId },
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
        setOwnedGames(prev => prev.filter(game => game.id !== gameId));
      }
    } catch (error) {
      console.error('Error removing game from owned list:', error);
      alert('Failed to remove game from owned list.');
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-700">Name: {user.name}</p>
      <p className="text-gray-700">Email: {user.email}</p>
      <p className="text-gray-700">Date Registered: {new Date(user.date).toLocaleDateString()}</p>
      
      <h2 className="text-xl font-bold mt-6 mb-2">Owned Games</h2>
      {ownedGames.length > 0 ? (
        <ul className="list-none pl-0">
          {ownedGames.map((game) => (
            <li key={game.id} className="flex items-center justify-between border-b py-2">
              <span className="text-gray-700">
                {game.title ? game.title : 'Unknown Title'} (ID: {game.id ? game.id : 'Unknown'})
              </span>
              <button
                className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors duration-200 group"
                onClick={() => removeGame(game.id)}
              >
                <span className="group-hover:hidden">×</span>
                <span className="hidden group-hover:inline">Remove Game ×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">You don't own any games yet.</p>
      )}
    </div>
  );
};

export default Profile;
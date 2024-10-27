import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [ownedGames, setOwnedGames] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setOwnedGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('There was an error fetching the user profile!', error);
    }
  };

  const removeGame = async (gameId) => {
    try {
      const response = await api.post('/users/remove-owned-game', { gameId });
      if (response.data.success) {
        setOwnedGames(prev => prev.filter(game => game.bggId !== gameId));
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
      <p className="text-gray-700">Member since: {new Date(user.date).toLocaleDateString()}</p>
      
      <h2 className="text-xl font-bold mt-6 mb-2">My Games ({ownedGames.length})</h2>
      {ownedGames.length > 0 ? (
        <ul className="list-none pl-0">
          {ownedGames.map((game) => (
            <li key={game._id} className="flex items-center justify-between border-b py-2">
              <div className="flex items-center">
                {game.image && (
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-16 h-16 object-contain mr-4"
                  />
                )}
                <div>
                  <span className="text-gray-700 font-medium">
                    {game.title}
                  </span>
                  {game.year && (
                    <span className="text-gray-500 ml-2">({game.year})</span>
                  )}
                </div>
              </div>
              <button
                className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors duration-200 group"
                onClick={() => removeGame(game.bggId)}
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

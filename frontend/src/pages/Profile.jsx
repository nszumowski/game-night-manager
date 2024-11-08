import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Profile = () => {
  const {userId} = useParams();
  const [user, setUser] = useState(null);
  const [ownedGames, setOwnedGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      let response;
      if (userId) {
        response = await api.get(`/users/profile/${userId}`);
        setIsOwnProfile(false);
        const friendsResponse = await api.get('/friends/list');
        setIsFriend(friendsResponse.data.friends.some(friend => friend._id === userId));
      } else {
        response = await api.get('/users/profile');
        setIsOwnProfile(true);
      }
      setUser(response.data);
      setOwnedGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('There was an error fetching the user profile!', error);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError('');

    const sanitizedName = newName.trim();
    if (sanitizedName.length < 1 || sanitizedName.length > 50) {
      setError('Name must be between 1 and 50 characters');
      return;
    }

    try {
      const response = await api.put('/users/update-profile', { name: sanitizedName });
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      setError(error.response?.data?.message || 'Failed to update name.');
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

  const removeFriend = async () => {
    try {
      await api.post('/friends/remove', { friendId: userId });
      setIsFriend(false);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isOwnProfile ? 'My Profile' : `${user.name}'s Profile`}
        </h1>
        {!isOwnProfile && isFriend && (
          <button
            onClick={removeFriend}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Remove Friend
          </button>
        )}
      </div>
      
      <div className="mb-4">
        {isOwnProfile && isEditing ? (
          <form onSubmit={handleUpdateName} className="flex flex-col gap-2">
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border p-2 rounded"
                required
                maxLength={50}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white p-2 rounded">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewName(user.name);
                  setError('');
                }}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2 items-center">
            <p className="text-gray-700">Name: {user.name}</p>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white p-2 rounded text-sm"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-700">Email: {user.email}</p>
      <p className="text-gray-700">Member since: {new Date(user.date).toLocaleDateString()}</p>
      
    </div>
  );
};

export default Profile;

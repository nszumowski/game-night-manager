import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Profile = () => {
  const {userId} = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [userGames, setUserGames] = useState([]);
  const [myGames, setMyGames] = useState([]);

  useEffect(() => {
    fetchUser();
    if (!isOwnProfile) {
      fetchMyGames();
    }
  }, [userId, isOwnProfile]);

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
      setUserGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('There was an error fetching the user profile!', error);
    }
  };

  const fetchMyGames = async () => {
    try {
      const response = await api.get('/users/profile');
      setMyGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('Error fetching owned games:', error);
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
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          {isOwnProfile ? 'My Games' : `${user.name}'s Games`} ({userGames.length})
        </h2>
        {userGames.length > 0 ? (
          <ul className="list-none pl-0">
            {userGames.map((game) => {
              const iSharedGame = myGames.some(myGame => myGame.bggId === game.bggId);
              return (
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
                  {!isOwnProfile && iSharedGame && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-4">
                      You own this
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-700">
            {isOwnProfile ? "You don't own any games yet." : `${user.name} doesn't own any games yet.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;

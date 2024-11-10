import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { FaExternalLinkAlt } from 'react-icons/fa';

const Profile = () => {
  const {userId} = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bggUsername: ''
  });
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
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bggUsername: user.bggUsername || ''
      });
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

      const userData = response.data.user || response.data;
      
      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        bggUsername: userData.bggUsername,
        date: userData.date || userData.createdAt,
        ownedGames: userData.ownedGames || []
      });
      
      setUserGames(userData.ownedGames || []);
      
      console.log('Profile response:', response.data);
      console.log('Processed user data:', userData);
      
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    const sanitizedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      bggUsername: formData.bggUsername.trim()
    };

    if (sanitizedData.name.length < 1 || sanitizedData.name.length > 50) {
      setError('Name must be between 1 and 50 characters');
      return;
    }

    try {
      const response = await api.put('/users/update-profile', sanitizedData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile.');
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
          {isOwnProfile ? 'My Profile' : `${user?.name}'s Profile`}
        </h1>
        {!isOwnProfile && isFriend && (
          <button
            onClick={removeFriend}
            aria-label="Remove friend"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Remove Friend
          </button>
        )}
      </div>
      
      <div className="mb-4">
        {isOwnProfile && isEditing ? (
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
                maxLength={50}
                aria-label="Edit name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
                aria-label="Edit email"
              />
            </div>

            <div>
              <label htmlFor="bggUsername" className="block text-sm font-medium text-gray-700 mb-1">
                BoardGameGeek Username
              </label>
              <input
                id="bggUsername"
                name="bggUsername"
                type="text"
                value={formData.bggUsername}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                aria-label="Edit BoardGameGeek username"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600" 
                aria-label="Save profile changes"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bggUsername: user.bggUsername || ''
                  });
                  setError('');
                }}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                aria-label="Cancel profile edit"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-gray-700"><strong>Name:</strong> {user?.name || 'Not available'}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p className="text-gray-700">
              <strong>BoardGameGeek Username:</strong> {' '}
              {user?.bggUsername ? (
                <a 
                  href={`https://boardgamegeek.com/user/${user.bggUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  {user.bggUsername}
                  <FaExternalLinkAlt className="text-xs" aria-label="Opens in new tab" />
                </a>
              ) : (
                'Not set'
              )}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white p-2 rounded text-sm w-fit hover:bg-blue-600"
                aria-label="Edit profile"
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-700">
        Member since: {user?.date ? new Date(user.date).toLocaleDateString() : 'Not available'}
      </p>
      
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
                        loading="lazy"
                        onError={(e) => e.target.src = '/placeholder-game.png'}
                      />
                    )}
                    <div>
                      <span className="text-gray-700 font-medium">
                        {game.title}
                      </span>
                      {game.year && (
                        <span className="text-gray-500 ml-2">({game.year})</span>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        {game.minPlayers && game.maxPlayers && (
                          <span className="mr-3">
                            {game.minPlayers === game.maxPlayers 
                              ? `${game.minPlayers} players`
                              : `${game.minPlayers}-${game.maxPlayers} players`}
                          </span>
                        )}
                        {game.bestWith && (
                          <span className="text-green-600">{game.bestWith}</span>
                        )}
                      </div>
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

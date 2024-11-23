import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { FaExternalLinkAlt, FaUser, FaCamera, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const {userId} = useParams();
  const { user, setUser, loading } = useAuth();
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
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isFriendDataLoading, setIsFriendDataLoading] = useState(userId ? true : false);

  const API_URL = process.env.APP_API_URL || 'http://localhost:5000';

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
        setIsFriendDataLoading(true);
        response = await api.get(`/users/profile/${userId}`);
        setIsOwnProfile(false);
        const friendsResponse = await api.get('/friends/list');
        setIsFriend(friendsResponse.data.friends.some(friend => friend._id === userId));
        setProfileData(response.data.user);
        
        // Set friend's games
        if (response.data.user && response.data.user.ownedGames) {
          setUserGames(
            response.data.user.ownedGames.sort((a, b) => 
              a.title.localeCompare(b.title)
            )
          );
        }
        setIsFriendDataLoading(false);
      } else {
        response = await api.get('/users/profile');
        setIsOwnProfile(true);
        setUser(response.data.user);
        
        // Set own games
        if (response.data.user && response.data.user.ownedGames) {
          setUserGames(
            response.data.user.ownedGames.sort((a, b) => 
              a.title.localeCompare(b.title)
            )
          );
        }
      }
    } catch (error) {
      console.error('There was an error fetching the user profile!', error);
      setIsFriendDataLoading(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    const form = new FormData();
    form.append('name', formData.name.trim());
    form.append('email', formData.email.trim());
    form.append('bggUsername', formData.bggUsername.trim());
    if (profileImage) {
      form.append('profileImage', profileImage);
    }

    try {
      const response = await api.put('/users/update-profile', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        setUser(prevUser => ({
          ...prevUser,
          ...response.data.user,
        }));
        setIsEditing(false);
        setProfileImage(null);
        setImagePreview(null);
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

  const handleRemoveImage = async () => {
    try {
      setProfileImage(null);
      setImagePreview(null);
      
      if (user.profileImage) {
        const form = new FormData();
        form.append('removeImage', 'true');
        
        const response = await api.put('/users/update-profile', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          setUser(prevUser => ({
            ...prevUser,
            profileImage: null
          }));
        } else {
          throw new Error(response.data.message || 'Failed to remove image');
        }
      }
    } catch (error) {
      console.error('Error removing profile image:', error);
      setError(error.response?.data?.message || 'Failed to remove profile image.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {isFriendDataLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-52"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {user?.profileImage || imagePreview ? (
              <img
                // src={imagePreview || `${API_URL}/uploads/profiles/${user.profileImage}`}
                src={isOwnProfile
                  ? (imagePreview || `${API_URL}/uploads/profiles/${user?.profileImage}`)
                  : `${API_URL}/uploads/profiles/${profileData?.profileImage}`
                }
                alt={`${user.name}'s profile`}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-game.png';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <FaUser className="text-gray-400 text-3xl" />
              </div>
            )}
            {isOwnProfile && isEditing && (
              <div className="absolute bottom-0 right-0 flex gap-2">
                {(imagePreview || user?.profileImage) && (
                  <button
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    aria-label="Remove profile image"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
                <label htmlFor="profileImage" className="cursor-pointer">
                  <div className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                    <FaCamera className="text-sm" />
                  </div>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {isOwnProfile ? 'My Profile' : `${profileData?.name}'s Profile`}
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
        </div>
      )}
      
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
            <p className="text-gray-700">
              <strong>Name:</strong> {isOwnProfile ? user?.name : profileData?.name || 'Not available'}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {isOwnProfile ? user?.email : profileData?.email || 'Not available'}
            </p>
            <p className="text-gray-700">
              <strong>BoardGameGeek Username:</strong> {' '}
              {isOwnProfile ? (
                user?.bggUsername ? (
                  <a 
                    href={`https://boardgamegeek.com/user/${user.bggUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    {user.bggUsername}
                    <FaExternalLinkAlt className="text-xs" aria-label="Opens in new tab" />
                  </a>
                ) : 'Not set'
              ) : (
                profileData?.bggUsername ? (
                  <a 
                    href={`https://boardgamegeek.com/user/${profileData.bggUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    {profileData.bggUsername}
                    <FaExternalLinkAlt className="text-xs" aria-label="Opens in new tab" />
                  </a>
                ) : 'Not set'
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
        Member since: {(isOwnProfile ? user?.date : profileData?.date) 
          ? new Date(isOwnProfile ? user.date : profileData.date).toLocaleDateString() 
          : 'Not available'}
      </p>
      
      {!isOwnProfile && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {`${profileData?.name}'s Games`} ({userGames.length})
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
                            <>
                              <span className="mr-2">
                                <strong>Players:</strong> {game.minPlayers === game.maxPlayers 
                                  ? `${game.minPlayers}`
                                  : `${game.minPlayers}-${game.maxPlayers}`}
                              </span>
                              <span className="mr-2"> | </span>
                            </>
                          )}
                          {game.bestWith && (
                            <>
                              <span className="mr-2">
                                <strong>Best with:</strong> {game.bestWith} players
                              </span>
                              <span className="mr-2"> | </span>
                            </>
                          )}
                          {(game.minPlaytime || game.maxPlaytime) && (
                            <>
                              <span className="mr-2">
                                <strong>Playtime:</strong> {game.minPlaytime === game.maxPlaytime 
                                  ? `${game.minPlaytime} minutes`
                                  : `${game.minPlaytime}-${game.maxPlaytime} minutes`}
                              </span>
                              <span className="mr-2"> | </span>
                            </>
                          )}
                          {game.weight && (
                            <span className="mr-2">
                              <strong>Weight:</strong> {game.weight}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-700">
                          <a 
                            href={`https://boardgamegeek.com/boardgame/${game.bggId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 mt-2 inline-block font-bold text-sm"
                            aria-label={`Read more about ${game.title} on BoardGameGeek`}
                          >
                            Read more on BGG →
                          </a>
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
              {isOwnProfile ? "You don't own any games yet." : `${profileData?.name} doesn't own any games yet.`}
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends/list');
      setFriends(response.data.friends);
      setFriendRequests(response.data.friendRequests);
    } catch (error) {
      setError('Error fetching friends');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/friends/search?email=${searchEmail}`);
      setSearchResults(response.data);
    } catch (error) {
      setError('Error searching users');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { userId });
      setSearchResults(searchResults.filter(user => user._id !== userId));
    } catch (error) {
      setError('Error sending friend request');
    }
  };

  const handleFriendRequest = async (requestId, action) => {
    try {
      await api.post(`/friends/request/${requestId}`, { action });
      fetchFriends();
    } catch (error) {
      setError(`Error ${action}ing friend request`);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await api.post('/friends/remove', { friendId });
      setFriends(friends.filter(friend => friend._id !== friendId));
    } catch (error) {
      setError('Error removing friend');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Search for Friends</h2>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email"
            className="border p-2 rounded mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul className="border rounded divide-y">
            {searchResults.map(user => (
              <li key={user._id} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => sendFriendRequest(user._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Friend Requests</h2>
        {friendRequests.length > 0 ? (
          <ul className="border rounded divide-y">
            {friendRequests.map(request => (
              <li key={request._id} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{request.from.name}</p>
                  <p className="text-gray-600">{request.from.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFriendRequest(request._id, 'accept')}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request._id, 'reject')}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No pending friend requests</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">My Friends</h2>
        {friends.length > 0 ? (
          <ul className="border rounded divide-y">
            {friends.map(friend => (
              <li key={friend._id} className="p-3 flex justify-between items-center">
                <Link to={`/profile/${friend._id}`} className="hover:text-blue-500">
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-gray-600">{friend.email}</p>
                </Link>
                <button
                  onClick={() => removeFriend(friend._id)}
                  className="text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors duration-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No friends added yet</p>
        )}
      </div>
      
    </div>
  );
};

export default Friends;

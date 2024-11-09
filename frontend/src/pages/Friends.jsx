import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

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

  const handleSearch = async (e, email) => {
    e.preventDefault();
    try {
      const response = await api.get(`/friends/search?email=${email}`);
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

  const tabs = [
    { id: 'friends', label: 'My Friends' },
    { id: 'search', label: 'Search for Friends' },
    { id: 'requests', label: 'Friend Requests' }
  ];

  const MyFriends = ({ 
    friends, 
    removeFriend 
  }) => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">My Friends</h2>
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
                  aria-label={`Remove friend ${friend.name}`}
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
    );
  };

  const SearchFriends = ({ handleSearch, searchResults, sendFriendRequest }) => {
    const [localSearchEmail, setLocalSearchEmail] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSearch(e, localSearchEmail);
    };

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Search for Friends</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="email"
            name="friendSearch"
            aria-label="Search friends by email"
            value={localSearchEmail}
            onChange={(e) => setLocalSearchEmail(e.target.value)}
            placeholder="Search by email"
            className="border p-2 rounded mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded" aria-label="Search for friends by email">
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
                  aria-label={`Send friend request to ${user.name}`}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const FriendRequests = ({ 
    friendRequests, 
    handleFriendRequest 
  }) => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
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
                    aria-label={`Accept friend request from ${request.from.name}`}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request._id, 'reject')}
                    aria-label={`Reject friend request from ${request.from.name}`}
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
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            aria-label={`Switch to ${tab.label} tab`}
            className={`py-2 px-4 mr-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'friends' && (
        <MyFriends 
          friends={friends}
          removeFriend={removeFriend}
        />
      )}

      {activeTab === 'search' && (
        <SearchFriends
          handleSearch={handleSearch}
          searchResults={searchResults}
          sendFriendRequest={sendFriendRequest}
        />
      )}

      {activeTab === 'requests' && (
        <FriendRequests
          friendRequests={friendRequests}
          handleFriendRequest={handleFriendRequest}
        />
      )}
    </div>
  );
};

export default Friends;

import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';

const FriendSelector = ({ friends, onSelectionChange, existingInvites = [] }) => {
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const API_URL = process.env.APP_API_URL || 'http://localhost:5000';

  // Filter out friends who have pending or declined invites
  const availableFriends = friends.filter(friend =>
    !existingInvites.some(invite =>
      invite.user._id === friend._id &&
      (invite.status === 'pending' || invite.status === 'declined')
    )
  );

  useEffect(() => {
    // Only initialize from existingInvites if there are any
    if (existingInvites.length > 0) {
      const initialSelection = new Set(
        existingInvites
          .filter(invite => invite.status === 'accepted')
          .map(invite => invite.user._id)
      );
      setSelectedFriends(initialSelection);
      onSelectionChange(Array.from(initialSelection));
    }
  }, [existingInvites]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelection = new Set(availableFriends.map(friend => friend._id));
      setSelectedFriends(newSelection);
      onSelectionChange(Array.from(newSelection));
    } else {
      setSelectedFriends(new Set());
      onSelectionChange([]);
    }
  };

  const handleFriendSelect = (friendId) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
    onSelectionChange(Array.from(newSelection));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="selectAll"
          className="h-4 w-4 text-blue-600"
          onChange={handleSelectAll}
          checked={selectedFriends.size === availableFriends.length}
        />
        <label htmlFor="selectAll" className="ml-2 text-gray-700">
          Select All Friends
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableFriends.map(friend => (
          <div key={friend._id} className="flex items-center space-x-3 p-2 border rounded">
            <input
              type="checkbox"
              id={`friend-${friend._id}`}
              checked={selectedFriends.has(friend._id)}
              onChange={() => handleFriendSelect(friend._id)}
              className="h-4 w-4 text-blue-600"
            />
            <label
              htmlFor={`friend-${friend._id}`}
              className="flex items-center space-x-3 cursor-pointer flex-1"
            >
              {friend.profileImage ? (
                <img
                  src={`${API_URL}/uploads/profiles/${friend.profileImage}`}
                  alt={`${friend.name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-400 text-xl" />
                </div>
              )}
              <span className="text-gray-700">{friend.name}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSelector; 
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import FriendSelector from './FriendSelector';

const CreateGameNightForm = ({ onSuccess }) => {
  const { showNotification } = useNotification();
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends/list');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      showNotification('Error fetching friends list', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/game-nights', {
        ...formData,
        invitees: selectedFriends
      });

      showNotification('Game night created successfully!', 'success');
      setFormData({ title: '', date: '', location: '', description: '' });
      setSelectedFriends([]);
      onSuccess();
    } catch (error) {
      console.error('Error creating game night:', error);
      showNotification('Failed to create game night', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Date</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows="4"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Invite Friends</label>
        <FriendSelector
          friends={friends}
          onSelectionChange={setSelectedFriends}
          existingInvites={[]}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Create Game Night
      </button>
    </form>
  );
};

export default CreateGameNightForm; 
import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';

const CreateGameNightForm = ({ onSuccess }) => {
  const { showNotification } = useNotification();
  const [gameNight, setGameNight] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    maxPlayers: 8,
    gameOptions: [],
    snacks: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/game-nights', gameNight);
      if (response.data.success) {
        showNotification('Game night created successfully!');
        setGameNight({
          title: '',
          date: '',
          location: '',
          description: '',
          maxPlayers: 8,
          gameOptions: [],
          snacks: '',
          notes: ''
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating game night:', error);
      showNotification('Failed to create game night', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={gameNight.title}
          onChange={(e) => setGameNight({ ...gameNight, title: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Date & Time</label>
        <input
          type="datetime-local"
          value={gameNight.date}
          onChange={(e) => setGameNight({ ...gameNight, date: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={gameNight.location}
          onChange={(e) => setGameNight({ ...gameNight, location: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Maximum Players</label>
        <input
          type="number"
          value={gameNight.maxPlayers}
          onChange={(e) => setGameNight({ ...gameNight, maxPlayers: parseInt(e.target.value) })}
          className="w-full border rounded px-3 py-2"
          min="2"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Description</label>
        <textarea
          value={gameNight.description}
          onChange={(e) => setGameNight({ ...gameNight, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Snacks (optional)</label>
        <textarea
          value={gameNight.snacks}
          onChange={(e) => setGameNight({ ...gameNight, snacks: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows="2"
          placeholder="List any snacks or drinks you'll provide or that guests should bring"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Additional Notes</label>
        <textarea
          value={gameNight.notes}
          onChange={(e) => setGameNight({ ...gameNight, notes: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows="3"
          placeholder="Any additional information for your guests"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Game Night
        </button>
      </div>
    </form>
  );
};

export default CreateGameNightForm; 
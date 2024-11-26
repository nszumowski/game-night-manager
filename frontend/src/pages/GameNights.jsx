import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';

const GameNights = () => {
  const { showNotification } = useNotification();
  const [gameNights, setGameNights] = useState({
    invitations: [],
    upcoming: [],
    past: []
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGameNight, setNewGameNight] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameNights();
  }, []);

  const fetchGameNights = async () => {
    try {
      const response = await api.get('/game-nights');
      const allGameNights = response.data.gameNights;
      
      // Sort game nights into categories
      const now = new Date();
      const categorizedNights = {
        invitations: allGameNights.filter(night => 
          night.invitees.some(invite => 
            invite.user._id === localStorage.getItem('userId') && 
            invite.status === 'pending'
          )
        ),
        upcoming: allGameNights.filter(night => 
          new Date(night.date) > now && 
          night.status === 'upcoming'
        ),
        past: allGameNights.filter(night => 
          new Date(night.date) < now || 
          night.status === 'completed'
        )
      };

      setGameNights(categorizedNights);
    } catch (error) {
      console.error('Error fetching game nights:', error);
      showNotification('Failed to load game nights', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGameNight = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/game-nights', newGameNight);
      if (response.data.success) {
        showNotification('Game night created successfully!');
        setIsCreateModalOpen(false);
        setNewGameNight({ title: '', date: '', location: '', description: '' });
        fetchGameNights();
      }
    } catch (error) {
      console.error('Error creating game night:', error);
      showNotification('Failed to create game night', 'error');
    }
  };

  const handleInviteResponse = async (gameNightId, status) => {
    try {
      await api.post(`/game-nights/${gameNightId}/respond`, { status });
      showNotification(`Invitation ${status === 'accepted' ? 'accepted' : 'declined'}`);
      fetchGameNights();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      showNotification('Failed to respond to invitation', 'error');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Nights</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Game Night
        </button>
      </div>

      {/* Pending Invitations Section */}
      {gameNights.invitations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
          <div className="space-y-4">
            {gameNights.invitations.map(night => (
              <div key={night._id} className="border p-4 rounded-lg shadow">
                <h3 className="font-bold">{night.title}</h3>
                <p className="text-gray-600">
                  {new Date(night.date).toLocaleDateString()} at {night.location}
                </p>
                <p className="text-gray-700 mt-2">{night.description}</p>
                <div className="mt-4 space-x-4">
                  <button
                    onClick={() => handleInviteResponse(night._id, 'accepted')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleInviteResponse(night._id, 'declined')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Game Nights Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Game Nights</h2>
        {gameNights.upcoming.length === 0 ? (
          <p className="text-gray-600">No upcoming game nights</p>
        ) : (
          <div className="space-y-4">
            {gameNights.upcoming.map(night => (
              <div key={night._id} className="border p-4 rounded-lg shadow">
                <h3 className="font-bold">{night.title}</h3>
                <p className="text-gray-600">
                  {new Date(night.date).toLocaleDateString()} at {night.location}
                </p>
                <p className="text-gray-700 mt-2">{night.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Game Nights Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Past Game Nights</h2>
        {gameNights.past.length === 0 ? (
          <p className="text-gray-600">No past game nights</p>
        ) : (
          <div className="space-y-4">
            {gameNights.past.map(night => (
              <div key={night._id} className="border p-4 rounded-lg shadow bg-gray-50">
                <h3 className="font-bold">{night.title}</h3>
                <p className="text-gray-600">
                  {new Date(night.date).toLocaleDateString()} at {night.location}
                </p>
                <p className="text-gray-700 mt-2">{night.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Game Night Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Game Night</h2>
            <form onSubmit={handleCreateGameNight}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newGameNight.title}
                  onChange={(e) => setNewGameNight({...newGameNight, title: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="datetime-local"
                  value={newGameNight.date}
                  onChange={(e) => setNewGameNight({...newGameNight, date: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newGameNight.location}
                  onChange={(e) => setNewGameNight({...newGameNight, location: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGameNight.description}
                  onChange={(e) => setNewGameNight({...newGameNight, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameNights;
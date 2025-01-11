import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';

const GameNightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [gameNight, setGameNight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGameNight, setEditedGameNight] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/users/profile');
        setCurrentUserId(response.data.user.id);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchGameNightDetails();
  }, [id]);

  const fetchGameNightDetails = async () => {
    try {
      const response = await api.get(`/game-nights/${id}`);
      setGameNight(response.data.gameNight);
      setEditedGameNight(response.data.gameNight);
    } catch (error) {
      console.error('Error fetching game night details:', error);
      showNotification('Failed to load game night details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isHost = gameNight?.host._id === currentUserId;

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/game-nights/${id}`, editedGameNight);
      setGameNight(response.data.gameNight);
      setIsEditing(false);
      showNotification('Game night updated successfully!');
    } catch (error) {
      console.error('Error updating game night:', error);
      showNotification('Failed to update game night', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this game night?')) {
      try {
        console.log('Attempting to delete game night:', id);

        await api.delete(`/game-nights/${id}`);
        navigate('/game-nights');
        showNotification('Game night deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting game night:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        showNotification('Failed to delete game night', 'error');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!gameNight) {
    return <div className="container mx-auto p-4">Game night not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/game-nights" className="text-blue-500 hover:text-blue-600">
          ← Back to Game Nights
        </Link>
        {isHost && (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editedGameNight.title}
                  onChange={(e) => setEditedGameNight({ ...editedGameNight, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={editedGameNight.date.slice(0, 16)}
                  onChange={(e) => setEditedGameNight({ ...editedGameNight, date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editedGameNight.location}
                  onChange={(e) => setEditedGameNight({ ...editedGameNight, location: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editedGameNight.description}
                  onChange={(e) => setEditedGameNight({ ...editedGameNight, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">{gameNight.title}</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                  <div className="space-y-3">
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(gameNight.date).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {gameNight.location}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-700">{gameNight.description}</p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Attendees</h2>
                <div className="space-y-2">
                  <p className="font-medium">Host: {gameNight.host.name}</p>
                  <div className="mt-2">
                    <h3 className="font-medium mb-2">Guests:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {gameNight.invitees
                        .filter(inv => inv.status === 'accepted')
                        .map(inv => (
                          <li key={inv.user._id}>{inv.user.name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameNightDetails; 
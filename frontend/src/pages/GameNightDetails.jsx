import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';

const GameNightDetails = () => {
  const { id } = useParams();
  const { showNotification } = useNotification();
  const [gameNight, setGameNight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameNightDetails();
  }, [id]);

  const fetchGameNightDetails = async () => {
    try {
      const response = await api.get(`/game-nights/${id}`);
      setGameNight(response.data.gameNight);
    } catch (error) {
      console.error('Error fetching game night details:', error);
      showNotification('Failed to load game night details', 'error');
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <Link to="/game-nights" className="text-blue-500 hover:text-blue-600">
          ← Back to Game Nights
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
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
                <p>
                  <span className="font-medium">Players:</span>{' '}
                  {gameNight.invitees.filter(inv => inv.status === 'accepted').length + 1}/{gameNight.maxPlayers}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{gameNight.description}</p>
            </div>
          </div>

          {gameNight.snacks && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Snacks & Drinks</h2>
              <p className="text-gray-700">{gameNight.snacks}</p>
            </div>
          )}

          {gameNight.notes && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Additional Notes</h2>
              <p className="text-gray-700">{gameNight.notes}</p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default GameNightDetails; 
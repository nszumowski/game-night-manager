import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import CreateGameNightForm from '../components/CreateGameNightForm';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const GameNights = () => {
  const { showNotification } = useNotification();
  const [allGameNights, setAllGameNights] = useState([]);
  const [gameNights, setGameNights] = useState({
    invitations: [],
    upcoming: [],
    past: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentUserId, setCurrentUserId] = useState(null);
  const now = new Date();

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
    if (currentUserId) {
      fetchGameNights();
    }
  }, [currentUserId]);

  const fetchGameNights = async () => {
    try {
      const response = await api.get('/game-nights');
      const allGameNights = response.data.gameNights;

      const categorizedNights = {
        invitations: allGameNights.filter(night =>
          night.invitees.some(invite =>
            invite.user._id === currentUserId &&
            invite.status === 'pending'
          )
        ),
        upcoming: allGameNights.filter(night =>
          new Date(night.date) > now &&
          night.status === 'upcoming' &&
          (
            night.host._id === currentUserId ||
            night.invitees.some(invite =>
              invite.user._id === currentUserId &&
              invite.status === 'accepted'
            )
          )
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

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Game Nights' },
    { id: 'past', label: 'Past Game Nights' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'create', label: 'Create Game Night' }
  ];

  const GameNightsList = ({ nights, isPast = false }) => (
    <div className="space-y-4">
      {nights.length === 0 ? (
        <p className="text-gray-600">No {isPast ? 'past' : 'upcoming'} game nights</p>
      ) : (
        nights.map(night => (
          <Link
            to={`/game-nights/${night._id}`}
            key={night._id}
            className="block border p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-bold text-xl text-blue-600">{night.title}</h3>
              <p className="text-gray-600">
                {new Date(night.date).toLocaleDateString()} at {night.location}
              </p>
              <p className="text-gray-700 mt-2">{night.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>Click to view details →</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  const InvitationsList = ({ invitations }) => (
    <div className="space-y-4">
      {invitations.length === 0 ? (
        <p className="text-gray-600">No pending invitations</p>
      ) : (
        invitations.map(night => (
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
        ))
      )}
    </div>
  );

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game Nights</h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            aria-label={`Switch to ${tab.label} tab`}
            className={`py-2 px-4 mr-2 ${activeTab === tab.id
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
      {activeTab === 'upcoming' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Upcoming Game Nights</h2>
          <GameNightsList nights={gameNights.upcoming} />
        </section>
      )}

      {activeTab === 'past' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Past Game Nights</h2>
          <GameNightsList nights={gameNights.past} isPast={true} />
        </section>
      )}

      {activeTab === 'invitations' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
          <InvitationsList invitations={gameNights.invitations} />
        </section>
      )}

      {activeTab === 'create' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create New Game Night</h2>
          <CreateGameNightForm onSuccess={fetchGameNights} />
        </section>
      )}
    </div>
  );
};

export default GameNights;
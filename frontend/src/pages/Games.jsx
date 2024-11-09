import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Games = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailedGames, setDetailedGames] = useState([]);
  const [addedGames, setAddedGames] = useState({});
  const [ownedGames, setOwnedGames] = useState([]);
  const [bggUsername, setBggUsername] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    fetchOwnedGames();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setDetailedGames([]);

    try {
      const response = await api.get('/games/search', {
        params: { query: searchTerm }
      });
      
      if (response.status === 404) {
        setError('No games found matching your search.');
        setGames([]);
        setTotalPages(0);
        return;
      }

      const gamesArray = response.data;
      setGames(gamesArray);
      setTotalPages(Math.ceil(gamesArray.length / 25));
      
      if (gamesArray.length > 0) {
        fetchDetailedGames(gamesArray.slice(0, 25));
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No games found matching your search.');
      } else {
        setError('There was an error searching for games. Please try again.');
      }
      setGames([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedGames = async (games) => {
    try {
      const detailedGamesArray = await Promise.all(games.map(async (game) => {
        const response = await api.get('/games/details', {
          params: { id: game.id }
        });
        const gameDetails = response.data;
        return { ...game, ...gameDetails };
      }));
      setDetailedGames(detailedGamesArray);
    } catch (error) {
      console.error('Error fetching game details:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * 25;
    const endIndex = page * 25;
    fetchDetailedGames(games.slice(startIndex, endIndex));
  };

  const fetchOwnedGames = async () => {
    try {
      const response = await api.get('/users/profile');
      // Make sure we're getting the populated game objects
      console.log('Fetched owned games:', response.data.ownedGames);
      setOwnedGames(response.data.ownedGames || []);
    } catch (error) {
      console.error('Error fetching owned games:', error);
    }
  };

  const addToOwnedGames = async (game) => {
    try {
      const response = await api.post('/users/add-owned-game', {
        gameTitle: game.title,
        gameId: game.id,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        bestWith: game.bestWith,
        year: game.year,
        image: game.image
      });
      if (response.data.success) {
        setOwnedGames(prev => [...prev, {
          title: game.title,
          bggId: game.id,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          bestWith: game.bestWith,
          year: game.year,
          image: game.image
        }]);
        setAddedGames(prev => ({ ...prev, [game.id]: true }));
        setTimeout(() => {
          setAddedGames(prev => ({ ...prev, [game.id]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding game to owned list:', error);
      alert('Failed to add game to owned list. It might already be in your list.');
    }
  };

  const removeFromOwnedGames = async (gameId) => {
    try {
      const response = await api.post('/users/remove-owned-game', { gameId });
      if (response.data.success) {
        setOwnedGames(prev => prev.filter(game => game.bggId !== gameId));
      }
    } catch (error) {
      console.error('Error removing game from owned list:', error);
      alert('Failed to remove game from owned list.');
    }
  };

  const handleImportCollection = async (e) => {
    e.preventDefault();
    setImportLoading(true);
    setError(null);

    try {
      const response = await api.get('/games/collection', {
        params: { username: bggUsername }
      });
      
      // Add each game to the owned games list
      for (const game of response.data) {
        await addToOwnedGames(game);
      }
      
      alert('Collection imported successfully!');
    } catch (err) {
      setError('There was an error importing your collection.');
    } finally {
      setImportLoading(false);
      setBggUsername('');
    }
  };

  const MyGames = ({ ownedGames, removeFromOwnedGames }) => {
    return (
      <div className="mb-8">
        MYGAMES
        <h2 className="text-2xl font-bold mb-4">My Games ({ownedGames.length})</h2>
        {ownedGames.length > 0 ? (
          <ul className="list-none pl-0">
            {ownedGames.map((game) => (
              <li key={game._id} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center">
                  {game.image && (
                    <img 
                      src={game.image} 
                      alt={game.title} 
                      className="w-16 h-16 object-contain mr-4"
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
                        <span className="mr-3">
                          {game.minPlayers === game.maxPlayers 
                            ? `${game.minPlayers} players`
                            : `${game.minPlayers}-${game.maxPlayers} players`}
                        </span>
                      )}
                      {game.bestWith && (
                        <span className="text-green-600">{game.bestWith}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors duration-200 group"
                  onClick={() => removeFromOwnedGames(game.bggId)}
                >
                  <span className="group-hover:hidden">×</span>
                  <span className="hidden group-hover:inline">Remove Game ×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">You don't own any games yet.</p>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'owned', label: 'My Games' },
    { id: 'search', label: 'Search for Games' },
    { id: 'import', label: 'Import Games' }
  ];

  return (
    <div className="container mx-auto p-4">
      RETURN
      <h1 className="text-2xl font-bold mb-4">Games</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
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
      {activeTab === 'owned' && (
        <MyGames 
          ownedGames={ownedGames} 
          removeFromOwnedGames={removeFromOwnedGames} 
        />
      )}

      {activeTab === 'search' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search for Games</h2>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter game name"
                  required
                  className="border p-2 rounded flex-grow"
                />
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white p-2 rounded"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </form>
          <div className="flex flex-col gap-5">
            {detailedGames.map(game => (
              <div key={game.id} className="flex flex-col border border-gray-300 p-5 rounded shadow">
                <h2 className="text-xl font-bold mb-5">{game.title} ({game.year})</h2>
                <div className="flex">
                  <img src={game.image} alt="Game" className="max-w-xs max-h-xs object-contain rounded border border-gray-200 p-2" />
                  <div className="flex flex-col mx-5">
                    <div className="text-sm text-gray-600 mb-3">
                      {game.minPlayers && game.maxPlayers && (
                        <span className="mr-3">
                          {game.minPlayers === game.maxPlayers 
                            ? `${game.minPlayers} players`
                            : `${game.minPlayers}-${game.maxPlayers} players`}
                        </span>
                      )}
                      {game.bestWith && (
                        <span className="text-green-600">{game.bestWith}</span>
                      )}
                    </div>
                    <p className="text-gray-700">{game.description}</p>
                  </div>
                </div>
                <div className="flex mt-2">
                {ownedGames.some(ownedGame => ownedGame.bggId === game.id) ? (
                  <>
                    <button 
                      className="bg-gray-300 text-gray-600 p-2 rounded mr-2 cursor-not-allowed"
                      disabled
                    >
                      Game Already in List
                    </button>
                    <button 
                      onClick={() => removeFromOwnedGames(game.id)}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      Remove from Owned Games
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => addToOwnedGames(game)} 
                    className={`${addedGames[game.id] ? 'bg-green-700' : 'bg-green-500'} text-white p-2 rounded`}
                    disabled={addedGames[game.id]}
                  >
                    {addedGames[game.id] ? 'Game Added' : 'Add to Owned Games'}
                  </button>
                )}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-500">Show Raw Data</summary>
                  <pre className="bg-gray-100 p-2 rounded">{game.rawData}</pre>
                </details>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {activeTab === 'import' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Import BGG Collection</h2>
          <form onSubmit={handleImportCollection} className="mb-4">
            <input
              type="text"
              value={bggUsername}
              onChange={(e) => setBggUsername(e.target.value)}
              placeholder="Enter BGG Username"
              required
              className="border p-2 rounded mr-2"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white p-2 rounded mt-2"
              disabled={importLoading}
            >
              {importLoading ? 'Importing...' : 'Import'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-5">
      {pages.map(page => (
        <button
          key={page}
          className={`mx-1 px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Games;

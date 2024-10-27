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

  useEffect(() => {
    fetchOwnedGames();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await api.get('/games/search', {
        params: { query: searchTerm }
      });
      const gamesArray = response.data;
      setGames(gamesArray);
      setTotalPages(Math.ceil(gamesArray.length / 25)); // Calculate total pages
      fetchDetailedGames(gamesArray.slice(0, 25)); // Fetch details for the first page
    } catch (err) {
      setError('There was an error fetching the games.');
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

  const addToOwnedGames = async (gameTitle, gameId) => {
    try {
      const response = await api.post('/users/add-owned-game', { gameTitle, gameId });
      if (response.data.success) {
        setOwnedGames(prev => [...prev, { title: gameTitle, bggId: gameId }]);
        setAddedGames(prev => ({ ...prev, [gameId]: true }));
        setTimeout(() => {
          setAddedGames(prev => ({ ...prev, [gameId]: false }));
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
        await addToOwnedGames(game.title, game.id);
      }
      
      alert('Collection imported successfully!');
    } catch (err) {
      setError('There was an error importing your collection.');
    } finally {
      setImportLoading(false);
      setBggUsername('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search for Board Games</h1>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter game name"
          required
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="flex flex-col gap-5">
        {detailedGames.map(game => (
          <div key={game.id} className="flex flex-col border border-gray-300 p-5 rounded shadow">
            <h2 className="text-xl font-bold mb-5">{game.title} ({game.year})</h2>
            <div className="flex">
              <img src={game.image} alt="Game" className="max-w-xs max-h-xs object-contain rounded border border-gray-200 p-2" />
              <p className="text-gray-700 mx-5">{game.description}</p>
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
                onClick={() => addToOwnedGames(game.title, game.id)} 
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
      <div className="mb-8 mt-4 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Import BGG Collection</h2>
        <form onSubmit={handleImportCollection} className="flex gap-4">
          <input
            type="text"
            value={bggUsername}
            onChange={(e) => setBggUsername(e.target.value)}
            placeholder="Enter BGG Username"
            required
            className="border p-2 rounded flex-grow"
          />
          <button 
            type="submit" 
            className="bg-green-500 text-white p-2 rounded min-w-[200px]"
            disabled={importLoading}
          >
            {importLoading ? 'Importing...' : 'Import BGG Collection'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
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

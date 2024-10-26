import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Games = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailedGames, setDetailedGames] = useState([]);
  const [addedGames, setAddedGames] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to the first page on new search

    try {
      const response = await axios.get('http://192.168.0.133:5000/api/games/search', {
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
        const response = await axios.get('http://192.168.0.133:5000/api/games/details', {
          params: { id: game.id }
        });
        const gameDetails = response.data;
        return { ...game, ...gameDetails };
      }));
      setDetailedGames(detailedGamesArray);
    } catch (err) {
      setError('There was an error fetching the game details.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * 25;
    const endIndex = page * 25;
    fetchDetailedGames(games.slice(startIndex, endIndex));
  };

  const addToOwnedGames = async (gameTitle) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.post('http://192.168.0.133:5000/api/users/add-owned-game', 
        { gameTitle },
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
        setAddedGames(prev => ({ ...prev, [gameTitle]: true }));
        setTimeout(() => {
          setAddedGames(prev => ({ ...prev, [gameTitle]: false }));
        }, 2000); // Reset after 2 seconds
      }
    } catch (error) {
      console.error('Error adding game to owned list:', error);
      alert('Failed to add game to owned list. It might already be in your list.');
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
            <button 
              onClick={() => addToOwnedGames(game.title)} 
              className={`${addedGames[game.title] ? 'bg-green-700' : 'bg-green-500'} text-white p-2 rounded mt-2`}
              disabled={addedGames[game.title]}
            >
              {addedGames[game.title] ? 'Game Added' : 'Add to Owned Games'}
            </button>
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
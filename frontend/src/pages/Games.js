import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Games.css';

const Games = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailedGames, setDetailedGames] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to the first page on new search

    try {
      const response = await axios.get(`http://192.168.0.132:5000/api/games/search?query=${searchTerm}`);
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
        const response = await axios.get(`http://192.168.0.132:5000/api/games/details?id=${game.id}`);
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

  return (
    <div>
      <h1>Search for Board Games</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter game name"
          required
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="games-container">
        {detailedGames.map(game => (
          <div key={game.id} className="game-item">
            <h2 className="game-title">{game.title} ({game.year})</h2>
            <div className="game-details">
              <img src={game.image} alt="Game" className="game-image" />
              <p className="game-description">{game.description}</p>
            </div>
            {/* {process.env.NODE_ENV === 'development' && ( */}
            <details>
              <summary>Show Raw Data</summary>
              <pre>{game.rawData}</pre>
            </details>
            {/* )} */}
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
    <div className="pagination">
      {pages.map(page => (
        <button
          key={page}
          className={page === currentPage ? 'active' : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Games;
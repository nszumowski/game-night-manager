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

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to the first page on new search

    try {
      const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/search?query=${searchTerm}&type=boardgame`);
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, 'text/xml');
      const items = xml.getElementsByTagName('item');
      const gamesArray = Array.from(items).map(item => ({
        id: item.getAttribute('id'),
        title: item.getElementsByTagName('name')[0].getAttribute('value'),
        year: item.getElementsByTagName('yearpublished')[0]?.getAttribute('value') || 'Unknown'
      }));
      setGames(gamesArray);
      setTotalPages(Math.ceil(gamesArray.length / 25)); // Calculate total pages
    } catch (err) {
      setError('There was an error fetching the games.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedGames = games.slice((currentPage - 1) * 25, currentPage * 25);

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
        {paginatedGames.map(game => (
          <div key={game.id} className="game-item">
            <h2 className="game-title">{game.title} ({game.year})</h2>
            <GameDetails id={game.id} />
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

const GameDetails = ({ id }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${id}`);
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        const item = xml.getElementsByTagName('item')[0];
        const image = item.getElementsByTagName('image')[0]?.textContent || 'No image available';
        const description = item.getElementsByTagName('description')[0]?.textContent || 'No description available';
        setDetails({ image, description });
      } catch (err) {
        setError('There was an error fetching the game details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <p>Loading details...</p>;
  if (error) return <p>{error}</p>;
  if (!details) return null;

  return (
    <div className="game-details">
      <img src={details.image} alt="Game" className="game-image" />
      <p className="game-description">{details.description}</p>
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Games.css';


const Games = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    } catch (err) {
      setError('There was an error fetching the games.');
    } finally {
      setLoading(false);
    }
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
        {games.map(game => (
          <div key={game.id} className="game-item">
            <h2 className="game-title">{game.title} ({game.year})</h2>
            <GameDetails id={game.id} />
          </div>
        ))}
      </div>
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

export default Games;
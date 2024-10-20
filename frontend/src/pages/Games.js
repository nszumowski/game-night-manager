import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Games.css';

require('dotenv').config(); // Load .env file

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
      const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/search?query=${searchTerm}&type=boardgame`);
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, 'text/xml');
      const items = xml.getElementsByTagName('item');
      const gamesArray = Array.from(items).map(item => ({
        id: item.getAttribute('id'),
        year: item.getElementsByTagName('yearpublished')[0]?.getAttribute('value') || 'Unknown'
      }));
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
        const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${game.id}`);
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        const item = xml.getElementsByTagName('item')[0];
        const primaryNameElement = Array.from(item.getElementsByTagName('name')).find(name => name.getAttribute('type') === 'primary');
        const title = primaryNameElement ? primaryNameElement.getAttribute('value') : item.getElementsByTagName('name')[0].getAttribute('value');
        const image = item.getElementsByTagName('thumbnail')[0]?.textContent || 'No image available';
        const description = item.getElementsByTagName('description')[0]?.textContent || 'No description available';
        const rawData = new XMLSerializer().serializeToString(item); // Format the raw XML data
        return { ...game, title, image, description, rawData };
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

/*
examples of returned data:
Board Game Expansion example:
<item type="boardgameexpansion" id="134277">
  <thumbnail>https://cf.geekdo-images.com/Ulqf4hNwO0ORsbq_Bo5tZQ__thumb/img/M5v2cBTqpsw9Lcb82vLX8MX6zz4=/fit-in/200x150/filters:strip_icc()/pic1488780.jpg</thumbnail>
  <image>https://cf.geekdo-images.com/Ulqf4hNwO0ORsbq_Bo5tZQ__original/img/hFjrKCFQWsW2tA6YzoEZPCP2MNE=/0x0/filters:format(jpeg)/pic1488780.jpg</image>

  <name type="primary" sortindex="1" value="World Wonders (fan expansion for Catan)" />

  <name type="alternate" sortindex="5" value="The 7 Wonders of Catan (fan expansion for Catan)" />

  <description>The Island of Catan is rich with resources and beauty. The great nations meet upon the island for a decade-long festival of culture and trade... and a grand competition. Living solely off of the land, they must build the greatest society they can in a short time. To do this, the nations decide to recreate the Wonders of the Ancient World. But only one of each Wonder can exist, and there are only so many Wonders that the land can support!&amp;#10;&amp;#10;This expansion, which has been in development for over 2 years, can be combined with The Settlers of Catan base game or with many of Catan: Seafarers and Catan: Traders &amp;amp; Barbarians scenarios. As you upgrade your Wonders, you will gain abilities that allow you to either rake in the resources or wreck havoc on your opponents. Combine these abilities in a game that will have you revisiting Catan as if you have never really played it before!&amp;#10;&amp;#10;</description>
  <yearpublished value="2012" />
  <minplayers value="3" />
  <maxplayers value="6" />
  <poll name="suggested_numplayers" title="User Suggested Number of Players" totalvotes="3">

    <results numplayers="1">
      <result value="Best" numvotes="0" />
      <result value="Recommended" numvotes="0" />
      <result value="Not Recommended" numvotes="2" />
    </results>

    <results numplayers="2">
      <result value="Best" numvotes="1" />
      <result value="Recommended" numvotes="0" />
      <result value="Not Recommended" numvotes="2" />
    </results>

    <results numplayers="3">
      <result value="Best" numvotes="2" />
      <result value="Recommended" numvotes="1" />
      <result value="Not Recommended" numvotes="0" />
    </results>

    <results numplayers="4">
      <result value="Best" numvotes="2" />
      <result value="Recommended" numvotes="1" />
      <result value="Not Recommended" numvotes="0" />
    </results>

    <results numplayers="5">
      <result value="Best" numvotes="0" />
      <result value="Recommended" numvotes="2" />
      <result value="Not Recommended" numvotes="0" />
    </results>

    <results numplayers="6">
      <result value="Best" numvotes="0" />
      <result value="Recommended" numvotes="2" />
      <result value="Not Recommended" numvotes="0" />
    </results>

    <results numplayers="6+">
      <result value="Best" numvotes="0" />
      <result value="Recommended" numvotes="0" />
      <result value="Not Recommended" numvotes="1" />
    </results>
  </poll>
  <poll-summary name="suggested_numplayers" title="User Suggested Number of Players">
    <result name="bestwith" value="Best with 3–4 players" />
    <result name="recommmendedwith" value="Recommended with 3–6 players" />
  </poll-summary> 			               				
  <playingtime value="60" />
  <minplaytime value="60" />
  <maxplaytime value="60" />
  <minage value="10" />

  <poll name="suggested_playerage" title="User Suggested Player Age" totalvotes="1">
    <results>
      <result value="2" numvotes="0" />
      <result value="3" numvotes="0" />
      <result value="4" numvotes="0" />
      <result value="5" numvotes="0" />
      <result value="6" numvotes="0" />
      <result value="8" numvotes="0" />
      <result value="10" numvotes="0" />
      <result value="12" numvotes="1" />
      <result value="14" numvotes="0" />
      <result value="16" numvotes="0" />
      <result value="18" numvotes="0" />
      <result value="21 and up" numvotes="0" />
    </results>
  </poll> 			      			
  
  <poll name="language_dependence" title="Language Dependence" totalvotes="2">
    <results>
      <result level="1" value="No necessary in-game text" numvotes="0" />
      <result level="2" value="Some necessary text - easily memorized or small crib sheet" numvotes="2" />
      <result level="3" value="Moderate in-game text - needs crib sheet or paste ups" numvotes="0" />
      <result level="4" value="Extensive use of text - massive conversion needed to be playable" numvotes="0" />
      <result level="5" value="Unplayable in another language" numvotes="0" />
    </results>
  </poll>

  <link type="boardgamecategory" id="1015" value="Civilization" />
  <link type="boardgamecategory" id="1042" value="Expansion for Base-game" />
  <link type="boardgamecategory" id="2687" value="Fan Expansion" />
  <link type="boardgamecategory" id="1026" value="Negotiation" />
  <link type="boardgamemechanic" id="2072" value="Dice Rolling" />
  <link type="boardgamemechanic" id="2040" value="Hand Management" />
  <link type="boardgamemechanic" id="2008" value="Trading" />
  <link type="boardgamemechanic" id="2015" value="Variable Player Powers" />
  <link type="boardgamefamily" id="3" value="Game: Catan" />
  <link type="boardgameexpansion" id="13" value="CATAN" inbound="true" />
  <link type="boardgameexpansion" id="325" value="CATAN: Seafarers" inbound="true" />
  <link type="boardgameexpansion" id="27760" value="CATAN: Traders &amp; Barbarians" inbound="true" />
  <link type="boardgamedesigner" id="68016" value="Scot Eaton" />
  <link type="boardgameartist" id="68016" value="Scot Eaton" />
  <link type="boardgamepublisher" id="4" value="(Self-Published)" />
</item>

Boardgame Example:

<item type="boardgame" id="5824">
  <thumbnail>https://cf.geekdo-images.com/q_TBkFbh6Hz2mkSdNeQMVQ__thumb/img/zyRGaqEd8Xv5BCB4cLVCrFKTC38=/fit-in/200x150/filters:strip_icc()/pic222987.jpg</thumbnail>
  <image>https://cf.geekdo-images.com/q_TBkFbh6Hz2mkSdNeQMVQ__original/img/1BXyD2KqtSHR1Oe3-zJ3YsxyT2c=/0x0/filters:format(jpeg)/pic222987.jpg</image>
  <name type="primary" sortindex="5" value="The Kids of Catan"/>
  <name type="alternate" sortindex="1" value="Barna fra Catan"/>
  <name type="alternate" sortindex="1" value="Catan Gyerekeknek"/>
  <name type="alternate" sortindex="1" value="Catán Junior"/>
  <name type="alternate" sortindex="1" value="Catan Junior"/>
  <name type="alternate" sortindex="5" value="Les Enfants de Catane"/>
  <name type="alternate" sortindex="1" value="Kids from Catan"/>
  <name type="alternate" sortindex="5" value="Die Kinder von Catan"/>
  <name type="alternate" sortindex="1" value="Kinderen van Catan"/>
  <description>
    A simplified building game for kids, based on the immensely popular The Settlers of Catan, wherein all players take part in the game at all times. The high quality wooden pieces are suitable not only for the game, but also for &amp;quot;free play.&amp;quot;&amp;#10;&amp;#10;Each player in turn rolls the die, and rotates the village plan clockwise that number of spaces. Resources are collected by each player depending on where their piece lands, and if one of each resource type has been collected by any player, that player may place one of their buildings on the village plan. If a player has built all of their buildings, they may build the Town Hall. The first player to build the Town Hall wins.&amp;#10;&amp;#10;Belongs to the Catan Series.&amp;#10;&amp;#10;
  </description>
  <yearpublished value="2003"/>
  <minplayers value="2"/>
  <maxplayers value="4"/>
  <poll name="suggested_numplayers" title="User Suggested Number of Players" totalvotes="11">
    <results numplayers="1">
      <result value="Best" numvotes="0"/>
      <result value="Recommended" numvotes="0"/>
      <result value="Not Recommended" numvotes="10"/>
    </results>
    <results numplayers="2">
      <result value="Best" numvotes="0"/>
      <result value="Recommended" numvotes="9"/>
      <result value="Not Recommended" numvotes="2"/>
    </results>
    <results numplayers="3">
      <result value="Best" numvotes="8"/>
      <result value="Recommended" numvotes="2"/>
      <result value="Not Recommended" numvotes="0"/>
    </results>
    <results numplayers="4">
      <result value="Best" numvotes="9"/>
      <result value="Recommended" numvotes="0"/>
      <result value="Not Recommended" numvotes="1"/>
    </results>
    <results numplayers="4+">
      <result value="Best" numvotes="0"/>
      <result value="Recommended" numvotes="1"/>
      <result value="Not Recommended" numvotes="8"/>
    </results>
  </poll>
  <poll-summary name="suggested_numplayers" title="User Suggested Number of Players">
    <result name="bestwith" value="Best with 3–4 players"/>
    <result name="recommmendedwith" value="Recommended with 2–4 players"/>
  </poll-summary>
  <playingtime value="20"/>
  <minplaytime value="20"/>
  <maxplaytime value="20"/>
  <minage value="4"/>
  <poll name="suggested_playerage" title="User Suggested Player Age" totalvotes="19">
    <results>
      <result value="2" numvotes="3"/>
      <result value="3" numvotes="12"/>
      <result value="4" numvotes="4"/>
      <result value="5" numvotes="0"/>
      <result value="6" numvotes="0"/>
      <result value="8" numvotes="0"/>
      <result value="10" numvotes="0"/>
      <result value="12" numvotes="0"/>
      <result value="14" numvotes="0"/>
      <result value="16" numvotes="0"/>
      <result value="18" numvotes="0"/>
      <result value="21 and up" numvotes="0"/>
    </results>
  </poll>
  <poll name="language_dependence" title="Language Dependence" totalvotes="11">
    <results>
      <result level="1" value="No necessary in-game text" numvotes="11"/>
      <result level="2" value="Some necessary text - easily memorized or small crib sheet" numvotes="0"/>
      <result level="3" value="Moderate in-game text - needs crib sheet or paste ups" numvotes="0"/>
      <result level="4" value="Extensive use of text - massive conversion needed to be playable" numvotes="0"/>
      <result level="5" value="Unplayable in another language" numvotes="0"/>
    </results>
  </poll>
  <link type="boardgamecategory" id="1041" value="Children's Game"/>
  <link type="boardgamecategory" id="1029" value="City Building"/>
  <link type="boardgamemechanic" id="2072" value="Dice Rolling"/>
  <link type="boardgamemechanic" id="2909" value="Random Production"/>
  <link type="boardgamemechanic" id="2035" value="Roll / Spin and Move"/>
  <link type="boardgamemechanic" id="2004" value="Set Collection"/>
  <link type="boardgamemechanic" id="2939" value="Track Movement"/>
  <link type="boardgamefamily" id="5607" value="Components: 3-Dimensional (3D)"/>
  <link type="boardgamefamily" id="68117" value="Components: Game Box Used In Play"/>
  <link type="boardgamefamily" id="68769" value="Components: Wooden pieces &amp; boards"/>
  <link type="boardgamefamily" id="3" value="Game: Catan"/>
  <link type="boardgamefamily" id="62080" value="Versions &amp; Editions: Junior Versions of Grown-Up Games"/>
  <link type="boardgameimplementation" id="13" value="CATAN" inbound="true"/>
  <link type="boardgamedesigner" id="11" value="Klaus Teuber"/>
  <link type="boardgameartist" id="12382" value="Tanja Donner"/>
  <link type="boardgameartist" id="26874" value="Michaela Kienle"/>
  <link type="boardgameartist" id="12834" value="Annette Nora Kara"/>
  <link type="boardgameartist" id="12839" value="Susanne Reichardt"/>
  <link type="boardgamepublisher" id="37" value="KOSMOS"/>
  <link type="boardgamepublisher" id="267" value="999 Games"/>
  <link type="boardgamepublisher" id="496" value="danspil"/>
  <link type="boardgamepublisher" id="2366" value="Devir"/>
  <link type="boardgamepublisher" id="10" value="Mayfair Games"/>
  <link type="boardgamepublisher" id="5145" value="Ticado"/>
  <link type="boardgamepublisher" id="42" value="Tilsit"/>
</item>

*/
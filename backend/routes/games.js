const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const xml2js = require('xml2js');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache with a TTL of 1 hour
const parser = new xml2js.Parser();

const parseXML = (xml) => {
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Search route
router.get('/search', async (req, res) => {
  const { query } = req.query;
  const cacheKey = `search_${query}`;

  if (cache.has(cacheKey)) {
    const cachedResults = cache.get(cacheKey);
    if (cachedResults.length === 0) {
      return res.status(404).json({ message: 'No games found matching your search.' });
    }
    return res.json(cachedResults);
  }

  try {
    const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/search?query=${query}&type=boardgame`);
    const result = await parseXML(response.data);

    if (!result.items || !result.items.item) {
      cache.set(cacheKey, []);
      return res.status(404).json({ message: 'No games found matching your search.' });
    }

    const items = Array.isArray(result.items.item) ? result.items.item : [result.items.item];
    const gamesArray = items.map(item => ({
      id: item.$.id,
      title: item.name[0].$.value,
      year: item.yearpublished ? item.yearpublished[0].$.value : null
    }));

    cache.set(cacheKey, gamesArray);
    res.json(gamesArray);
  } catch (err) {
    console.error('Error searching games:', err);
    res.status(500).json({ message: 'There was an error searching for games.' });
  }
});

// Game details route
router.get('/details', async (req, res) => {
  const { id } = req.query;
  const cacheKey = `details_${id}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`);
    const result = await parseXML(response.data);
    const item = result.items.item[0];

    // Get basic info
    const primaryNameElement = item.name.find(name => name.$.type === 'primary');
    const title = primaryNameElement ? primaryNameElement.$.value : item.name[0].$.value;
    const image = item.thumbnail ? item.thumbnail[0] : 'No image available';
    const description = item.description ? item.description[0] : 'No description available';

    // Get player counts
    const minPlayers = item.minplayers ? parseInt(item.minplayers[0].$.value) : null;
    const maxPlayers = item.maxplayers ? parseInt(item.maxplayers[0].$.value) : null;

    // Get best with count from poll
    let bestWith = null;
    if (item.poll) {
      const playerCountPoll = item.poll.find(poll => poll.$.name === 'suggested_numplayers');
      if (playerCountPoll) {
        let highestVotes = 0;
        playerCountPoll.results.forEach(result => {
          const bestVotes = parseInt(result.result.find(r => r.$.value === 'Best')?.$.numvotes || 0);
          if (bestVotes > highestVotes) {
            highestVotes = bestVotes;
            bestWith = `Best with ${result.$.numplayers} players`;
          }
        });
      }
    }

    const gameDetails = {
      id,
      title,
      image,
      description,
      minPlayers,
      maxPlayers,
      bestWith,
      rawData: response.data
    };

    cache.set(cacheKey, gameDetails);
    res.json(gameDetails);
  } catch (err) {
    console.error('Error fetching game details:', err);
    res.status(500).json({ error: 'There was an error fetching the game details.' });
  }
});

// Add after the existing routes
router.get('/collection', async (req, res) => {
  const { username } = req.query;
  const cacheKey = `collection_${username}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const response = await axios.get(`https://www.boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`);
    const result = await parseXML(response.data);

    if (!result.items || !result.items.item) {
      return res.status(404).json({ error: 'No collection found for this username' });
    }

    const items = Array.isArray(result.items.item) ? result.items.item : [result.items.item];

    // Fetch detailed information for each game
    const gamesArray = await Promise.all(items.map(async item => {
      const gameId = item.$.objectid;
      // Use the existing details endpoint to maintain consistency
      const detailsResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
      const detailsResult = await parseXML(detailsResponse.data);
      const gameItem = detailsResult.items.item[0];

      const primaryNameElement = gameItem.name.find(name => name.$.type === 'primary');
      const title = primaryNameElement ? primaryNameElement.$.value : gameItem.name[0].$.value;
      const minPlayers = gameItem.minplayers ? parseInt(gameItem.minplayers[0].$.value) : null;
      const maxPlayers = gameItem.maxplayers ? parseInt(gameItem.maxplayers[0].$.value) : null;
      const image = gameItem.thumbnail ? gameItem.thumbnail[0] : null;
      const year = gameItem.yearpublished ? gameItem.yearpublished[0].$.value : null;

      let bestWith = null;
      if (gameItem.poll) {
        const playerCountPoll = gameItem.poll.find(poll => poll.$.name === 'suggested_numplayers');
        if (playerCountPoll) {
          let highestVotes = 0;
          playerCountPoll.results.forEach(result => {
            const bestVotes = parseInt(result.result.find(r => r.$.value === 'Best')?.$.numvotes || 0);
            if (bestVotes > highestVotes) {
              highestVotes = bestVotes;
              bestWith = `Best with ${result.$.numplayers} players`;
            }
          });
        }
      }

      return {
        id: gameId,
        title,
        year,
        image,
        minPlayers,
        maxPlayers,
        bestWith
      };
    }));

    cache.set(cacheKey, gamesArray);
    res.json(gamesArray);
  } catch (err) {
    console.error('Error fetching collection:', err);
    res.status(500).json({ error: 'There was an error fetching the collection.' });
  }
});

module.exports = router;

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

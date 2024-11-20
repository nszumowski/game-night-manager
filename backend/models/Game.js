const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  bggId: {
    type: String,
    required: true,
    unique: true
  },
  year: String,
  description: String,
  image: String,
  minPlayers: Number,
  maxPlayers: Number,
  bestWith: String,
  minPlaytime: Number,
  maxPlaytime: Number,
  weight: Number
});

module.exports = Game = mongoose.model('games', GameSchema);

// Exampl XML data for boardgame
/*
<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="312484">
    <thumbnail>https://cf.geekdo-images.com/6GqH14TJJhza86BX5HCLEQ__thumb/img/J8SVmGOJXZGxNjkT3xYNQU7Haxg=/fit-in/200x150/filters:strip_icc()/pic5674958.jpg</thumbnail>
    <image>https://cf.geekdo-images.com/6GqH14TJJhza86BX5HCLEQ__original/img/CXqwimJPonWy1oyXEMgPN_ZVmUI=/0x0/filters:format(jpeg)/pic5674958.jpg</image>
    <name type="primary" sortindex="1" value="Lost Ruins of Arnak" />
    <name type="alternate" sortindex="1" value="Arnak elveszett romjai" />
    <name type="alternate" sortindex="1" value="Arnak: Kadonneet rauniot" />
    <name type="alternate" sortindex="1" value="Izgubljene ruševine Arnaka" />
    <name type="alternate" sortindex="4" value="Le Rovine Perdute di Arnak" />
    <name type="alternate" sortindex="4" value="As Ruínas Perdidas de Arnak" />
    <name type="alternate" sortindex="5" value="Las Ruinas Perdidas de Arnak" />
    <name type="alternate" sortindex="5" value="Les Ruines Perdues de Narak" />
    <name type="alternate" sortindex="4" value="De verdwenen ruïnes van Arnak" />
    <name type="alternate" sortindex="5" value="Die verlorenen Ruinen von Arnak" />
    <name type="alternate" sortindex="1" value="Zaginiona wyspa Arnak" />
    <name type="alternate" sortindex="1" value="Ztracený ostrov Arnak" />
    <name type="alternate" sortindex="1" value="Τα Ερείπια του Άρνακ" />
    <name type="alternate" sortindex="1" value="Загублені руїни Арнаку" />
    <name type="alternate" sortindex="1" value="Изгубените руини на Арнак" />
    <name type="alternate" sortindex="1" value="Руины острова Арнак" />
    <name type="alternate" sortindex="1" value="חורבותיה של ארנאק" />
    <name type="alternate" sortindex="1" value="นครสาบสูญแห่งอาร์นัค" />
    <name type="alternate" sortindex="1" value="アルナックの失われし遺跡" />
    <name type="alternate" sortindex="1" value="阿納克遺蹟|阿纳克遗迹" />
    <name type="alternate" sortindex="1" value="아르낙의 잊혀진 유적" />
    <description>On an uninhabited island in uncharted seas, explorers have found traces of a great civilization. Now you will lead an expedition to explore the island, find lost artifacts, and face fearsome guardians, all in a quest to learn the island's secrets.&#10;&#10;Lost Ruins of Arnak combines deck-building and worker placement in a game of exploration, resource management, and discovery. In addition to traditional deck-builder effects, cards can also be used to place workers, and new worker actions become available as players explore the island. Some of these actions require resources instead of workers, so building a solid resource base will be essential. You are limited to only one action per turn, so make your choice carefully... what action will benefit you most now? And what can you afford to do later... assuming someone else doesn't take the action first!?&#10;&#10;Decks are small, and randomness in the game is heavily mitigated by the wealth of tactical decisions offered on the game board. With a variety of worker actions, artifacts, and equipment cards, the set-up for each game will be unique, encouraging players to explore new strategies to meet the challenge.&#10;&#10;Discover the Lost Ruins of Arnak!&#10;&#10;—description from the publisher&#10;&#10;</description>
    <yearpublished value="2020" />
    <minplayers value="1" />
    <maxplayers value="4" />
    <poll name="suggested_numplayers" title="User Suggested Number of Players" totalvotes="918">
      <results numplayers="1">
        <result value="Best" numvotes="92" />
        <result value="Recommended" numvotes="349" />
        <result value="Not Recommended" numvotes="129" />
      </results>
      <results numplayers="2">
        <result value="Best" numvotes="236" />
        <result value="Recommended" numvotes="519" />
        <result value="Not Recommended" numvotes="36" />
      </results>
      <results numplayers="3">
        <result value="Best" numvotes="525" />
        <result value="Recommended" numvotes="213" />
        <result value="Not Recommended" numvotes="13" />
      </results>
      <results numplayers="4">
        <result value="Best" numvotes="182" />
        <result value="Recommended" numvotes="396" />
        <result value="Not Recommended" numvotes="98" />
      </results>
      <results numplayers="4+">
        <result value="Best" numvotes="1" />
        <result value="Recommended" numvotes="1" />
        <result value="Not Recommended" numvotes="375" />
      </results>
    </poll>
    <poll-summary name="suggested_numplayers" title="User Suggested Number of Players">
      <result name="bestwith" value="Best with 3 players" />
      <result name="recommmendedwith" value="Recommended with 1–4 players" />
    </poll-summary>
    <playingtime value="120" />
    <minplaytime value="30" />
    <maxplaytime value="120" />
    <minage value="12" />
    <poll name="suggested_playerage" title="User Suggested Player Age" totalvotes="184">
      <results>
        <result value="2" numvotes="0" />
        <result value="3" numvotes="0" />
        <result value="4" numvotes="0" />
        <result value="5" numvotes="0" />
        <result value="6" numvotes="3" />
        <result value="8" numvotes="18" />
        <result value="10" numvotes="78" />
        <result value="12" numvotes="74" />
        <result value="14" numvotes="10" />
        <result value="16" numvotes="1" />
        <result value="18" numvotes="0" />
        <result value="21 and up" numvotes="0" />
      </results>
    </poll>
    <poll name="language_dependence" title="Language Dependence" totalvotes="40">
      <results>
        <result level="1" value="No necessary in-game text" numvotes="1" />
        <result level="2" value="Some necessary text - easily memorized or small crib sheet" numvotes="4" />
        <result level="3" value="Moderate in-game text - needs crib sheet or paste ups" numvotes="28" />
        <result level="4" value="Extensive use of text - massive conversion needed to be playable" numvotes="5" />
        <result level="5" value="Unplayable in another language" numvotes="2" />
      </results>
    </poll>
    <link type="boardgamecategory" id="1022" value="Adventure" />
    <link type="boardgamecategory" id="1050" value="Ancient" />
    <link type="boardgamecategory" id="1020" value="Exploration" />
    <link type="boardgamecategory" id="1010" value="Fantasy" />
    <link type="boardgamecategory" id="1097" value="Travel" />
    <link type="boardgamemechanic" id="2912" value="Contracts" />
    <link type="boardgamemechanic" id="2664" value="Deck, Bag, and Pool Building" />
    <link type="boardgamemechanic" id="2900" value="Market" />
    <link type="boardgamemechanic" id="3099" value="Multi-Use Cards" />
    <link type="boardgamemechanic" id="2846" value="Once-Per-Game Abilities" />
    <link type="boardgamemechanic" id="2948" value="Resource to Move" />
    <link type="boardgamemechanic" id="2819" value="Solo / Solitaire Game" />
    <link type="boardgamemechanic" id="2828" value="Turn Order: Progressive" />
    <link type="boardgamemechanic" id="2082" value="Worker Placement" />
    <link type="boardgamefamily" id="65191" value="Components: Multi-Use Cards" />
    <link type="boardgamefamily" id="62884" value="Components: Official Music Soundtrack" />
    <link type="boardgamefamily" id="70360" value="Digital Implementations: Board Game Arena" />
    <link type="boardgamefamily" id="70354" value="Digital Implementations: Yucata" />
    <link type="boardgamefamily" id="79690" value="Islands: Fictional" />
    <link type="boardgamefamily" id="5666" value="Players: Games with Solitaire Rules" />
    <link type="boardgamefamily" id="21940" value="Theme: Archaeology / Paleontology" />
    <link type="boardgamefamily" id="69032" value="Theme: Temple" />
    <link type="boardgamefamily" id="18319" value="Theme: Tropical" />
    <link type="boardgamefamily" id="51732" value="Theme: Tropical Islands" />
    <link type="boardgameexpansion" id="349330" value="Lost Ruins of Arnak: Alicorn Promo Card" />
    <link type="boardgameexpansion" id="341254" value="Lost Ruins of Arnak: Expedition Leaders" />
    <link type="boardgameexpansion" id="430008" value="Lost Ruins of Arnak: Rat Promo Card" />
    <link type="boardgameexpansion" id="336817" value="Lost Ruins of Arnak: Saxophone Promo Card" />
    <link type="boardgameexpansion" id="349092" value="Lost Ruins of Arnak: Solo Mini Expansions" />
    <link type="boardgameexpansion" id="330677" value="Lost Ruins of Arnak: Soothsayer's Runes Promo Card" />
    <link type="boardgameexpansion" id="429590" value="Lost Ruins of Arnak: Storage Box" />
    <link type="boardgameexpansion" id="382350" value="Lost Ruins of Arnak: The Missing Expedition" />
    <link type="boardgameexpansion" id="338841" value="Lost Ruins of Arnak: The Search for Professor Kutil" />
    <link type="boardgameaccessory" id="403238" value="Lost Ruins of Arnak + Expansions: The GiftForge Insert" />
    <link type="boardgameaccessory" id="411879" value="Lost Ruins of Arnak + Expedition Leaders + The Missing Expedition: Eurohell Design Organizer" />
    <link type="boardgameaccessory" id="428708" value="Lost Ruins of Arnak + Expedition Leaders + The Missing Expedition: Laserox Organizer" />
    <link type="boardgameaccessory" id="356104" value="Lost Ruins of Arnak + Expedition Leaders: Eurohell Design Organizer" />
    <link type="boardgameaccessory" id="356036" value="Lost Ruins of Arnak + Expedition Leaders: GGG Insert/Organizer" />
    <link type="boardgameaccessory" id="367238" value="Lost Ruins of Arnak + Expedition Leaders: Laserox Organizer" />
    <link type="boardgameaccessory" id="363147" value="Lost Ruins of Arnak + Expedition Leaders: The GiftForge Insert" />
    <link type="boardgameaccessory" id="365793" value="Lost Ruins of Arnak + Expedition Leaders: Tower Rex Organizer" />
    <link type="boardgameaccessory" id="329934" value="Lost Ruins of Arnak: e-Raptor Insert" />
    <link type="boardgameaccessory" id="365313" value="Lost Ruins of Arnak: e-Raptor Plexiglass token set" />
    <link type="boardgameaccessory" id="339390" value="Lost Ruins of Arnak: Eurohell Design 3D starting player alarm clock" />
    <link type="boardgameaccessory" id="349938" value="Lost Ruins of Arnak: Eurohell Design 3D Upgrade Compasses &amp; Coins" />
    <link type="boardgameaccessory" id="339389" value="Lost Ruins of Arnak: Eurohell Design Coin &amp; Compass Sleeves" />
    <link type="boardgameaccessory" id="357877" value="Lost Ruins of Arnak: Eurohell Design Organizer" />
    <link type="boardgameaccessory" id="333625" value="Lost Ruins of Arnak: Folded Space Insert" />
    <link type="boardgameaccessory" id="399792" value="Lost Ruins of Arnak: Folded Space Insert (Second Edition)" />
    <link type="boardgameaccessory" id="355545" value="Lost Ruins of Arnak: GGG Insert/Organizer" />
    <link type="boardgameaccessory" id="334814" value="Lost Ruins of Arnak: Laserox Organizer" />
    <link type="boardgameaccessory" id="359071" value="Lost Ruins of Arnak: LevityGames Meeple Upgrade Meeple Stickers" />
    <link type="boardgameaccessory" id="418049" value="Lost Ruins of Arnak: Missing Expedition – Laserox Organizer Upgrade Kit" />
    <link type="boardgameaccessory" id="370606" value="Lost Ruins of Arnak: Multiverse Coin/Compass Tokens" />
    <link type="boardgameaccessory" id="359948" value="Lost Ruins of Arnak: reDrewno Insert" />
    <link type="boardgameaccessory" id="343453" value="Lost Ruins of Arnak: Shipshape Gamer Organizer" />
    <link type="boardgameaccessory" id="382564" value="Lost Ruins of Arnak: Sloyca Insert" />
    <link type="boardgameaccessory" id="378771" value="Lost Ruins of Arnak: Spielmaterial.de Upgrade" />
    <link type="boardgameaccessory" id="373846" value="Lost Ruins of Arnak: Spike Craft Insert" />
    <link type="boardgameaccessory" id="348553" value="Lost Ruins of Arnak: The GiftForge Insert" />
    <link type="boardgameaccessory" id="365800" value="Lost Ruins of Arnak: Tower Rex Organizer" />
    <link type="boardgamedesigner" id="127823" value="Elwen" />
    <link type="boardgamedesigner" id="127822" value="Mín" />
    <link type="boardgameartist" id="115373" value="Ondřej Hrdina" />
    <link type="boardgameartist" id="127825" value="Jiří Kůs" />
    <link type="boardgameartist" id="114458" value="Filip Murmak" />
    <link type="boardgameartist" id="94497" value="Jakub Politzer" />
    <link type="boardgameartist" id="119983" value="František Sedláček" />
    <link type="boardgameartist" id="11961" value="Milan Vavroň" />
    <link type="boardgamepublisher" id="7345" value="Czech Games Edition" />
    <link type="boardgamepublisher" id="46980" value="Brädspel.se" />
    <link type="boardgamepublisher" id="10768" value="Cranio Creations" />
    <link type="boardgamepublisher" id="2366" value="Devir" />
    <link type="boardgamepublisher" id="23205" value="DiceTree Games" />
    <link type="boardgamepublisher" id="22560" value="Fantasmagoria" />
    <link type="boardgamepublisher" id="29194" value="GaGa Games" />
    <link type="boardgamepublisher" id="52408" value="Games4you" />
    <link type="boardgamepublisher" id="8820" value="Gém Klub Kft." />
    <link type="boardgamepublisher" id="38505" value="HeidelBÄR Games" />
    <link type="boardgamepublisher" id="1391" value="Hobby Japan" />
    <link type="boardgamepublisher" id="8923" value="IELLO" />
    <link type="boardgamepublisher" id="6214" value="Kaissa Chess &amp; Games" />
    <link type="boardgamepublisher" id="3218" value="Lautapelit.fi" />
    <link type="boardgamepublisher" id="25203" value="Lex Games" />
    <link type="boardgamepublisher" id="46500" value="Lord of Boards" />
    <link type="boardgamepublisher" id="7992" value="MINDOK" />
    <link type="boardgamepublisher" id="22973" value="More Fun Co., Ltd." />
    <link type="boardgamepublisher" id="30552" value="One Moment Games" />
    <link type="boardgamepublisher" id="7466" value="Rebel Sp. z o.o." />
    <link type="boardgamepublisher" id="44204" value="Spilbræt.dk" />
    <link type="boardgamepublisher" id="4932" value="White Goblin Games" />
  </item>
</items>
*/
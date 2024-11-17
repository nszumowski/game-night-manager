# Game Night Manager

Game Night Manager is a modern app that can be used in the web browser (and eventually on iPhone/Android).

## Initial MVP Features

- Authenticated user accounts
- Users can add other users as friends with the ability to accept or decline friend connections
- Users can create groups called "game nights", which will be private to the admin of the game night and invited users
- Users can invite other users/friends to a game night
- Users can accept or decline invitations, or leave a game night
- Users can add board games to their "owned games" list
- Users will have public profile pages that show a list of owned games and a button to add as a friend
- Users looking at their own profile page will also see game nights they have been invited to
- The games are initially pulled from an external API from BoardGameGeek using their BGG_XML_API2
- The users invited to the game night group will vote on which board game to play for game night from their collected library of owned games
- A game night group will have a chat, comment, or message board feature specific to planning that game night
- Users can search and sort games by the number of players and playtime (number of players and playtime will come with game XML from the BoardGameGeek API)

## Frontend

- **React**: A popular JavaScript library for building user interfaces, which will allow you to create a responsive and dynamic web app.
- **Redux**: For state management, to handle the complex state interactions in your app.
- **Axios**: For making HTTP requests to your backend and the BoardGameGeek API.
- **React Router**: For handling routing in your web app.

## Backend

- **Node.js**: A JavaScript runtime for building scalable server-side applications.
- **Express.js**: A web application framework for Node.js, to create RESTful APIs.
- **MongoDB**: A NoSQL database that is flexible and scalable, suitable for storing user data, game nights, and messages.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Passport.js**: For authentication, to handle user login and registration.
- **Socket.io**: For real-time communication, to implement the chat/message board feature.

## Additional Tools

- **JWT (JSON Web Tokens)**: For securing API endpoints and managing user sessions.
- **BoardGameGeek API**: To fetch game data.
- **Docker**: For containerizing your application, making it easier to deploy and scale.

## Steps to Start

### Set Up the Project Structure

1. Create a monorepo using tools like Lerna or Nx to manage both frontend and backend codebases.

### Initialize the Backend

1. Set up a Node.js project with Express.
2. Connect to MongoDB using Mongoose.
3. Implement user authentication with Passport.js and JWT.
4. Create RESTful endpoints for user management, friend management, game nights, and chat.

### Initialize the Frontend

1. Set up a React project for the web application.
2. Implement authentication, user management, and game night features.
3. Use Axios to interact with the backend API.

### Implement Real-Time Chat

1. Use Socket.io on both the backend and frontend to enable real-time messaging.

### Fetch Data from BoardGameGeek API

1. Use Axios to fetch game data from the BoardGameGeek API and store it in the user's "owned games" list.

### Set Up the Development Environment

1. Install Node.js, npm, and MongoDB.
2. Set up your project structure and initialize the backend and frontend projects.

### Implement Authentication

1. Set up Passport.js for user authentication.
2. Create login and registration pages in the frontend.

### Develop Core Features

1. Implement user management, friend management, and game night creation.
2. Integrate the BoardGameGeek API to fetch game data.

### Add Real-Time Communication

1. Use Socket.io to implement the chat/message board feature.

### Testing and Deployment

1. Write unit and integration tests.
2. Use Docker to containerize your application for easier deployment.

## Project Structure

```
game-night-manager/
├── .env
├── .gitignore
├── backend/
│   ├── config/
│   │   ├── keys.js
│   │   └── passport.js
│   ├── controllers/
│   ├── Dockerfile
│   ├── models/
│   │   ├── User.js
│   │   └── Game.js
│   ├── package.json
│   ├── routes/
│   │   ├── users.js
│   │   └── games.js
│   └── server.js
├── docker-compose.yml
├── frontend/
│   ├── build/
│   │   ├── asset-manifest.json
│   │   ├── index.html
│   │   └── static/
│   │       ├── css/
│   │       └── js/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── components/
│       │   └── Navbar.js
│       ├── index.css
│       ├── index.js
│       └── pages/
│           ├── GameNight.js
│           ├── Games.js
│           ├── Home.js
│           ├── Login.js
│           ├── Logout.js
│           ├── Profile.js
│           └── Register.js
├── LICENSE.txt
├── package.json
└── README.md
```

## License

This project is licensed under a Proprietary License Agreement - see the LICENSE.txt file for details.

## TODO

- [ ] **Implement some form of caching for api queries - store search results even if not in database?**
- [ ] **Implement image caching - clear game images viewed less than a month ago? unless a new version is in search or import? store locally?**
- [ ] Move common components to a shared library
- [ ] Turn game list into a Component to reuse on my games and friend profiles
- [ ] Update stored game data from BGG API if changed during a search or import
- [ ] Profile - Update/Forgot Password functionality
- [ ] Emails for friend requests and game night invitations
- [ ] Games - Sort games in owned list alphabetically
- [ ] Games - Trim amount of text on game cards in search results
- [ ] Games - Add link to BGG page
- [ ] Game Night - Add game night creation and management features
- [ ] Game Night - Integrate messaging system or real-time chat for game nights
- [ ] Game Night - Implement voting system for game selection - random, ranked, weighted? This is optional, the game manager can pick the game(s) or make a poll
- [ ] oAuth?
- [ ] Invitiations instead of open registration initially?
- [ ] Develop mobile app versions (iOS/Android)
- [ ] Add unit and integration tests
- [x] Games - Pull number of players and playtime from BGG API
- [x] Fix - Menu update when logged in/out
- [x] Profile - BGG name field
- [x] Profile - Update button should allow editing for all profile fields, not just email
- [x] Profile - User image upload and display in profiles and user search
- [x] Buttons should have aria-labels
- [x] Input fields should have aria-labels and names
- [x] Lazy load images
- [x] Fix - 500 error if game is not found in search
- [x] Get user game list
- [x] Name update
- [x] Move games list from Profile to Games page
- [x] Implement friend management system (Add/Remove, Accept/Decline)
- [x] Show error when wrong password or email is entered
- [x] **Fix routing 404 direct page issues**
- [x] **Get refresh token working**
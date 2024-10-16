# game-night-manager

Game Night Manager is a modern app that can be used in the web browser (and eventually on iphone/android). 

# Initial MVP Features, it will have:
Authenticated user accounts
Users can add other users as friends with the ability to accept or decline friend connections
Users can create groups called "game nights", which will be private to the admin of the game night and invited users
Users can invite other users/friends to a game night
Users can accept or decline invitation, or leave a game night
Users can add board games to their "owned games" list
Users will have publiuc profile pages that show list of owned games and a button to add as friend
Users looking at their own profile page will also see game nights they have been invited to
The games are initially pulled from an external API from Boardgamegeek using their BGG_XML_API2. 
The users invited to the game night group will vote on which board game to play for game night from their collected library of owned games. 
A game night group will have a chat, comment, or messageboard feature specific to planning that game night
Users can search and sort games by number of players and play time (number of plays and playtime will comes with game xml fron the board game geek api).


# Frontend:
React: A popular JavaScript library for building user interfaces, which will allow you to create a responsive and dynamic web app.
Redux: For state management, to handle the complex state interactions in your app.
Axios: For making HTTP requests to your backend and the BoardGameGeek API.
React Router: For handling routing in your web app.

# Backend:
Node.js: A JavaScript runtime for building scalable server-side applications.
Express.js: A web application framework for Node.js, to create RESTful APIs.
MongoDB: A NoSQL database that is flexible and scalable, suitable for storing user data, game nights, and messages.
Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
Passport.js: For authentication, to handle user login and registration.
Socket.io: For real-time communication, to implement the chat/messageboard feature.

# Additional Tools:
JWT (JSON Web Tokens): For securing API endpoints and managing user sessions.
BoardGameGeek API: To fetch game data.
Docker: For containerizing your application, making it easier to deploy and scale.

# Steps to Start:
Set Up the Project Structure:

Create a monorepo using tools like Lerna or Nx to manage both frontend and backend codebases.
Initialize the Backend:

Set up a Node.js project with Express.
Connect to MongoDB using Mongoose.
Implement user authentication with Passport.js and JWT.
Create RESTful endpoints for user management, friend management, game nights, and chat.
Initialize the Frontend:

Set up a React project for the web application.
Implement authentication, user management, and game night features.
Use Axios to interact with the backend API.
Implement Real-Time Chat:

Use Socket.io on both the backend and frontend to enable real-time messaging.
Fetch Data from BoardGameGeek API:

Use Axios to fetch game data from the BoardGameGeek API and store it in the user's "owned games" list.

# Set Up the Development Environment:

Install Node.js, npm, and MongoDB.
Set up your project structure and initialize the backend and frontend projects.
Implement Authentication:

Set up Passport.js for user authentication.
Create login and registration pages in the frontend.
Develop Core Features:

Implement user management, friend management, and game night creation.
Integrate the BoardGameGeek API to fetch game data.
Add Real-Time Communication:

Use Socket.io to implement the chat/messageboard feature.
Testing and Deployment:

Write unit and integration tests.
Use Docker to containerize your application for easier deployment.

# Example Project Structure:

game-night-manager/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── package.json
├── .gitignore
└── README.md
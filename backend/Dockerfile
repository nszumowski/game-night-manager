# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Add build arguments
ARG MONGO_URI
ARG JWT_SECRET
ARG NODE_ENV
ARG PORT

# Set the environment variables
ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

# Copy package.json and package-lock.json from the backend directory on the host
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code from the backend directory on the host
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the app
CMD ["node", "server.js"]
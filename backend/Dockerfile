# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install Sharp dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

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

# Copy package files first
COPY package*.json ./

# Install dependencies with platform-specific Sharp
RUN npm install --os=linux --cpu=x64 sharp
RUN npm install --include=optional sharp
RUN npm rebuild sharp --verbose
RUN npm install compression

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Add entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
# Use an official Node.js runtime as a parent image
FROM node:16 AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Add build arguments
ARG APP_API_URL
ARG APP_ENV

# Set the environment variables
ENV APP_API_URL=${APP_API_URL}
ENV APP_ENV=${APP_ENV}

# Copy package.json and package-lock.json from the frontend directory on the host
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code from the frontend directory on the host
COPY . .

# Build the React app with Vite
RUN npm run build

# Use an official Nginx image to serve the built app
FROM nginx:alpine

# Copy the built files from the build stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /usr/share/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Define the command to run the app
CMD ["nginx", "-g", "daemon off;"]
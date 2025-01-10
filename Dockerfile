FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for development mode
# RUN npm install -g nodemon

# Copy application code
COPY . .

# Expose the port your app runs on
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

# Define the command to start the app
CMD ["npm", "start"]

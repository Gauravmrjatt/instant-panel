# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .
COPY prometheus.yml /etc/prometheus/prometheus.yml
# Expose the port your app runs on
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

# RUN npm run build
# Define the command to start the app
CMD ["npm", "start"]

# Use an official Node.js runtime as the base image
FROM node:18-alpine

RUN npm install --location=global ts-node-dev@2.0.0

# Set the working directory in the container
WORKDIR /backend-app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# env dev
RUN npm install

# clean cache
RUN npm run clean

# build
RUN npm run build



# Install the dependencies (env prod)
# RUN npm ci

# Copy the rest of the application code
COPY . .

# env port 8000
ENV PORT=8000

# Expose the port your application will be listening on
EXPOSE 8000

# Start the Node.js application in dev mode
CMD ["npm", "run", "start:build"]

# Start the Node.js application in prod mode
# CMD ["npm", "start"]

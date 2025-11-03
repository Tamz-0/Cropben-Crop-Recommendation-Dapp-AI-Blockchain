# Corrected Dockerfile for client (client/Dockerfile)
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the client source code
COPY . .

# EXPOSE 5173 (Vite default)
EXPOSE 5173

# Run dev server, '--host' makes it accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package.json ./

# Install dependencies without running scripts to avoid issues
RUN npm install --ignore-scripts

# Copy rest of the source code
COPY . .

# Build the project
RUN npm run build

# Expose any port if required (not explicitly needed for MCP over stdio)

# Command to start the server
CMD ["npm", "start"]

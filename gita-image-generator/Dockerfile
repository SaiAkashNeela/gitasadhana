FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY src ./src
COPY .env ./

# Create necessary directories
RUN mkdir -p data images logs

# Use dumb-init to run the app
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["npm", "start"]

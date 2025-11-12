FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Copy SSH key (will be mounted via volume in production)
RUN mkdir -p /root/.ssh

# Expose port
EXPOSE 3000

CMD ["npm", "start"]

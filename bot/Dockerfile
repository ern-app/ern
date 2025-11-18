# Use Node.js 20 LTS (Alpine for smaller image)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json* ./

# Copy bot package.json and wagmi package (if it's a dependency)
COPY bot/package.json ./bot/
COPY packages/wagmi/package.json ./packages/wagmi/

# Install all dependencies (including tsx for running TypeScript)
RUN npm ci --workspace=bot

# Copy wagmi source (if needed by bot)
COPY packages/wagmi/ ./packages/wagmi/

# Copy bot source code
COPY bot/ ./bot/

# Type check the code (validation only, no compilation)
WORKDIR /app/bot
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Create logs directory and set permissions
RUN mkdir -p bot/logs && chown -R botuser:nodejs /app

# Switch to non-root user
USER botuser

# Set working directory to bot
WORKDIR /app/bot

# Run the bot with tsx
CMD ["npm", "start"]

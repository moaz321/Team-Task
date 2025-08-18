#Builder Stage
FROM node:18-alpine AS builder
WORKDIR /app

#Install dependencies
COPY package*.json ./
RUN npm ci

#Copy all source code
COPY . .

#Build Next.js app
RUN npm run build
# Runner Stage
FROM node:18-alpine AS runner
WORKDIR /app

#Create a non-root user 
RUN addgroup -S app && adduser -S app -G app

#Copy production files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Switch to non-root user
USER app

# Set our environment variables
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck for Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost:3000/api/healthz || exit 1

# Start Next.js app
CMD ["node", "node_modules/.bin/next", "start"]


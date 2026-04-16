# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && /bin/sh -c 'for attempt in 1 2 3; do npm ci --no-audit --progress=false && exit 0; if [ "$attempt" -eq 3 ]; then exit 1; fi; echo "npm ci failed, retrying in 5 seconds..."; sleep 5; done'

COPY . .

# Production stage
FROM node:20-alpine

RUN /bin/sh -c 'for attempt in 1 2 3; do apk add --no-cache ffmpeg && exit 0; if [ "$attempt" -eq 3 ]; then exit 1; fi; echo "apk add ffmpeg failed, retrying in 5 seconds..."; sleep 5; done'

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/server.js ./
COPY --from=builder /app/worker.js ./

EXPOSE 5000

CMD ["node", "server.js"]

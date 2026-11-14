FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Build arguments for client-side environment variables
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies based on package.json
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the production Next.js app
ENV NODE_ENV=production
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start production server
CMD ["npm", "run", "start"]

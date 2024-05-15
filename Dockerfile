FROM node:lts-alpine3.19

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./


RUN npm install -g pnpm


# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .


CMD ["pnpm", "start"]


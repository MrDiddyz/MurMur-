FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
COPY apps/server/package.json ./apps/server/package.json
RUN npm install
COPY apps/server ./apps/server
EXPOSE 8080
CMD ["npm", "run", "start", "-w", "@murmur/server"]

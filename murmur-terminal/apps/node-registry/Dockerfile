FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/node-registry/package.json ./apps/node-registry/package.json
COPY prisma ./prisma
RUN npm install
COPY apps/node-registry ./apps/node-registry
RUN npm run prisma:generate -w @murmur/node-registry
EXPOSE 8081
CMD ["npm", "run", "start", "-w", "@murmur/node-registry"]

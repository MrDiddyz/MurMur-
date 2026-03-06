FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY apps/api/package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY apps/api/server.js ./

EXPOSE 3001

CMD ["node", "server.js"]

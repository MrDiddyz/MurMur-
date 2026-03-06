FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY apps/worker/package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY apps/worker/server.js ./

EXPOSE 3010

CMD ["node", "server.js"]

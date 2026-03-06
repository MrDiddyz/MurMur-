FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY apps/web/package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY apps/web/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]

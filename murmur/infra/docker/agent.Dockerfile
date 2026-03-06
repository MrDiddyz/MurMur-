FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

ARG AGENT_DIR=agents/planner-agent

COPY ${AGENT_DIR}/package.json ./package.json
RUN npm install --omit=dev && npm cache clean --force

COPY ${AGENT_DIR}/server.js ./server.js

EXPOSE 3100

CMD ["node", "server.js"]

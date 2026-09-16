FROM node:22-bookworm-slim
WORKDIR /app
# rien a voir avec le .env du projet
ENV NODE_ENV=production


COPY package*.json ./
# garde uniquement les dep pour production
RUN npm ci --omit=dev

COPY . .

USER node
EXPOSE 3000
CMD ["node", "app.js"]
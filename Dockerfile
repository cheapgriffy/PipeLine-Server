FROM node:22

WORKDIR /app

COPY ./src .
#COPY <source> <destination>

COPY package*.json .
RUN npm install
COPY . .

CMD ["node", "app.js"]
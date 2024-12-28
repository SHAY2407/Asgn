# Use official Node.js image
FROM node:18.9.1

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["nodemon", "start"]
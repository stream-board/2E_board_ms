FROM node:8

ENV REDIS_HOST "redis"

RUN mkdir /board-ms
WORKDIR /board-ms

COPY . /board-ms
COPY package.json /board-ms
COPY package-lock.json /board-ms
RUN npm install

CMD ["npm", "start"]


FROM node:9

ENV REDIS_HOST "redis"
ENV MASTER_KEY "masterKey"

RUN mkdir /board-ms
WORKDIR /board-ms

COPY . /board-ms
COPY package.json /board-ms
COPY package-lock.json /board-ms
RUN npm install

CMD ["npm", "start"]


import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'

const app = express(apiRoot, api);
const server = http.createServer(app);
const io = require('socket.io')(server);
//In-memory DB
const redis = require('redis');
const redisClient = redis.createClient(6379, 'redis');


mongoose.connect(mongo.uri, { useMongoClient: true })
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data.room);
  });

  socket.on('path', (data) => {
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('path', data);
  });

  socket.on('line', (data) => {
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('line', data);
  });

  socket.on('registerId', (userNick, userId) => {
    redisClient.set(userNick, socket.id, () => {
      console.log(userNick + 'in redis');
    });
  });

  socket.on('setAdminId', (userId) => {
    redisClient.set('admin', socket.id, () => {
        console.log('admin id setted');
    });
  });

  socket.on('askForBoard', (userId, userNick) => {
    console.log('user ' + userNick + ' ask');
    redisClient.get('admin', (err, socketId) => {
      console.log(socketId);
      socket.to(socketId).emit('askForBoard', userId, userNick);
    });
  });

  socket.on('answerForBoard', (adminRes, userId, userNick) => {
    console.log(adminRes);
    let msg = 'Tu solicitud del tablero fue rechazada';

    /*if(adminRes) {
      msg = 'Tienes permiso para usar el tablero';
    };*/

    redisClient.get(userNick, (err, socketId) => {
      if(adminRes) {
        msg = 'Tienes permiso para usar el tablero';
        redisClient.set('drawer', socketId, () => {
          console.log('Drawer '+ userNick);
        });
      };

      socket.to(socketId).emit('answerForBoard',msg);
    })
  });
});

export default app

import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import express from './services/express'
import api from './api'

const app = express(apiRoot, api);
const server = http.createServer(app);
const io = require('socket.io')(server);
//In-memory DB
const redis = require('redis');
const redisClient = redis.createClient(6379, 'redis');


setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

app.get('/turns', (req, res) => {
  res.sendFile(__dirname + '/turns.html');
});

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data.room);
  })

  socket.on('path', (data) => {
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('path', data);
  })

  socket.on('line', (data) => {
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('line', data);
  })

  socket.on('registerId', (data) => {
    redisClient.del(data.userNick, (err, reply) => {
      redisClient.set(data.userNick, socket.id);
    })
  })

  socket.on('setAdminId', (data) => {
    redisClient.del('admin', (err, reply) => {
      redisClient.set('admin', socket.id);
    })
  })

  socket.on('askForBoard', (data) => {
    redisClient.get('admin', (err, socketId) => {
      socket.to(socketId).emit('askForBoard', data);
    });
  })

  socket.on('answerForBoard', (data) => {
    let msg = 'Tu solicitud del tablero fue rechazada';

    redisClient.get(data.userNick, (err, socketId) => {
      if(data.adminAns) {
        msg = 'Tienes permiso para usar el tablero';
        redisClient.set('drawer', socketId, () => {
          console.log('Drawer '+ data.userNick);
        });
      };

      socket.to(socketId).emit('answerForBoard',msg);
    });
  })

  socket.on('resetBoard', () => {
    redisClient.get('admin', (err, socketId) => {
      redisClient.set('drawer', socketId);
      io.to(socketId).emit('resetBoard');
    });
  })
});

export default app

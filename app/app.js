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
    let room = Object.keys(socket.rooms)[0];

    let roomData = JSON.stringify({
      'adminSocketId': socket.id,
      'drawerSocketId': socket.id
    })
    redisClient.set(room, roomData);
  })

  socket.on('askForBoard', (data) => {
    let room = Object.keys(socket.rooms)[0];

    redisClient.get(room, (err, roomData) => {
      let jsonData = JSON.parse(roomData);
      socket.to(jsonData.adminSocketId).emit('askForBoard', data);
    });
  })

  socket.on('answerForBoard', (data) => {
    let room = Object.keys(socket.rooms)[0];
    let msg = 'Tu solicitud del tablero fue rechazada';

    redisClient.get(data.userNick, (err, socketId) => {
      if(data.adminAns) {
        let roomData = JSON.stringify({
          'adminSocketId': socket.id,
          'drawerSocketId': socketId
        })

        msg = 'Tienes permiso para usar el tablero';
        redisClient.set(room, roomData);
      }

      socket.to(socketId).emit('answerForBoard',msg);
    })
  })

  socket.on('resetBoard', () => {
    let room = Object.keys(socket.rooms)[0];

    redisClient.get(room, (err, roomData) => {
      let jsonData = JSON.parse(roomData);
      let adminSocketId = jsonData.adminSocketId;

      jsonData.drawer = adminSocketId;
      let updateRoom = JSON.stringify(jsonData);

      redisClient.set(room, updateRoom);
      io.to(adminSocketId).emit('resetBoard');
    });
  })
});

export default app

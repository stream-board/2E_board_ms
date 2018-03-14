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
  res.sendFiles(__dirname + '/test/turns.html');
});

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

  socket.on('registerId', (data) => {
    redisClient.set(data.userNick, socket.id, () => {
      console.log(data.userNick + 'in redis');
    });
  });

  socket.on('setAdminId', (data) => {
    redisClient.set('admin', socket.id, () => {
        console.log('admin id setted');
    });
  });

  socket.on('askForBoard', (data) => {
    console.log('user ' + data.userNick + ' ask');
    redisClient.get('admin', (err, socketId) => {
      console.log(socketId);
      socket.to(socketId).emit('askForBoard', data);
    });
  });

  socket.on('answerForBoard', (data) => {
    console.log(data.adminAns);
    let msg = 'Tu solicitud del tablero fue rechazada';

    /*if(adminAns) {
      msg = 'Tienes permiso para usar el tablero';
    };*/

    redisClient.get(userNick, (err, socketId) => {
      if(data.adminAns) {
        msg = 'Tienes permiso para usar el tablero';
        redisClient.set('drawer', socketId, () => {
          console.log('Drawer '+ data.userNick);
        });
      };

      socket.to(socketId).emit('answerForBoard',msg);
    })
  });
});

export default app

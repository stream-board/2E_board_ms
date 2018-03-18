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
  var room = socket.handshake['query']['room'];
  var nick = socket.handshake['query']['nick'];

  if(!io.sockets.adapter.rooms[room]) {
    let roomData = {
      admin: socket.id,
      drawer: socket.id
    }
    redisClient.del(room, (err, reply) => {
      redisClient.set(room, JSON.stringify(roomData));
    })
    io.to(socket.id).emit('admin');
  }

  redisClient.del(socket.id, (err, reply) => {
    redisClient.set(socket.id, nick);
  })

  socket.join(room);

  socket.on('draw', (data) => {
    redisClient.get(room, (err, roomData) => {
      let roomObj = JSON.parse(roomData);
      if(socket.id === roomObj.drawer){
        socket.to(room).broadcast.emit('draw', data);
      }
    })
  })

  socket.on('askForBoard', () => {
    redisClient.get(room, (err, roomData) => {
      let roomObj = JSON.parse(roomData);
      redisClient.get(socket.id, (err, nick) => {
        if(socket.id !== roomObj.admin){
          socket.to(roomObj.admin).emit('askForBoard', {nick: nick, socketId: socket.id});
        }
      })
    });
  })

  socket.on('answerForBoard', (data) => {
    redisClient.get(room, (err, roomData) => {
      let roomObj = JSON.parse(roomData);
      if(data.answer && roomObj.admin === socket.id) {
        let exDrawer = roomObj.drawer;
        roomObj.drawer = data.socketId;
        redisClient.set(room, JSON.stringify(roomObj));
        socket.to(data.socketId).emit('answerForBoard',data.answer);
        socket.to(exDrawer).emit('lostPermission',data.answer);
      };
    })
    
  })

  socket.on('resetBoard', () => {
    redisClient.get(room, (err, roomData) => {
      let roomObj = JSON.parse(roomData);
      if(roomObj.admin === socket.id){
        let exDrawer = roomObj.drawer;
        roomObj.drawer = roomObj.admin;
        redisClient.set(room, JSON.stringify(roomObj));
        io.to(socket.id).emit('resetBoard');
        io.to(exDrawer).emit('lostPermission');
      }
    });
  })

  socket.on('disconnect', () => {
    redisClient.get(room, (err, roomData) => {
      let roomObj = JSON.parse(roomData);
      if(socket.id === roomObj.admin){
        if(io.sockets.adapter.rooms[room]){
          var users = Object.keys(io.sockets.adapter.rooms[room].sockets);
          for(let i=0; i<users.length; i++) {
            io.to(users[i]).emit('hostLeft');
            io.sockets.connected[users[i]].leave(room); 
          }
        }
      } else {
        socket.leave(room);
      }
    });
  })
});

export default app

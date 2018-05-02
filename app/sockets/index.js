import redisClient from '../services/redis'

function initializeSocket(server){
    const io = require('socket.io')(server);
    io.on('connection', (socket) => {
        var room = socket.handshake['query']['room'];
        var nick = socket.handshake['query']['nick'];
        var id = socket.handshake['query']['id'];
      
        redisClient.get(room, (err, roomData) => {
          let roomObj = JSON.parse(roomData);
          if(roomObj.adminId == id){
            roomObj.adminId = id;
            roomObj.drawerSocket = socket.id;
            roomObj.adminSocket = socket.id;
            redisClient.set(room, JSON.stringify(roomObj));
            io.to(socket.id).emit('admin');
          } else {
          }
        });
      
        redisClient.del(socket.id, (err, reply) => {
          redisClient.set(socket.id, nick);
        })
      
        socket.join(room);
      
        socket.on('draw', (data) => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            if(socket.id === roomObj.drawerSocket){
              socket.to(room).broadcast.emit('draw', data);
            }
          })
        })

        socket.on('clear', () => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            if(socket.id === roomObj.drawerSocket){
              socket.to(room).emit('clear');
            }
          })
        })
      
        socket.on('askForBoard', () => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            console.log(roomObj);
            redisClient.get(socket.id, (err, nick) => {
              if(socket.id !== roomObj.adminSocket){
                socket.to(roomObj.adminSocket).emit('askForBoard', {nick: nick, socketId: socket.id});
              }
            })
          });
        })
      
        socket.on('answerForBoard', (data) => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            if(data.answer && roomObj.adminSocket === socket.id) {
              let exDrawer = roomObj.drawerSocket;
              roomObj.drawerSocket = data.socketId;
              redisClient.set(room, JSON.stringify(roomObj));
              socket.to(exDrawer).emit('lostPermission',data.answer);
              redisClient.get(data.socketId, (err, nick) => {
                io.to(room).emit('newDrawer', nick)
              })
            }
            socket.to(data.socketId).emit('answerForBoard',data.answer);
          })
          
        })
      
        socket.on('resetBoard', () => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            if(roomObj.adminSocket === socket.id){
              let exDrawer = roomObj.drawerSocket;
              roomObj.drawerSocket = roomObj.adminSocket;
              redisClient.set(room, JSON.stringify(roomObj));
              redisClient.get(socket.id, (err, nick) => {
                io.to(room).emit('newDrawer', nick)
              })
              io.to(exDrawer).emit('lostPermission');
              io.to(socket.id).emit('resetBoard');
            }
          });
        })

        socket.on('reconnect', () => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            console.log(`Reconnected ${id}`)
            if(roomObj.adminId == id){
              roomObj.adminSocket = socket.id;
              redisClient.set(room, JSON.stringify(roomObj));
              io.to(socket.id).emit('admin');
            } else {
            }
          });
        })
      
        socket.on('disconnect', () => {
          redisClient.get(room, (err, roomData) => {
            let roomObj = JSON.parse(roomData);
            if(socket.id === roomObj.adminSocket){
              if(io.sockets.adapter.rooms[room]){
                var users = Object.keys(io.sockets.adapter.rooms[room].sockets);
                for(let i=0; i<users.length; i++) {
                  io.to(users[i]).emit('hostLeft');
                  io.sockets.connected[users[i]].leave(room); 
                }
              }
            } else {
              io.to(room).emit('userDisconnected', nick)
              socket.leave(room);
            }
          });
        })
    });
}

export default initializeSocket
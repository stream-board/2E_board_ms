import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'

const app = express(apiRoot, api)
const server = http.createServer(app)
const io = require('socket.io')(server);

mongoose.connect(mongo.uri, { useMongoClient: true })
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

io.on('connection', function(socket){
  socket.on('join', function(data) {
    socket.join(data.room);
  });
  socket.on('path', function(data){
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('path', data);
  })
  socket.on('line', function(data){
    let room = Object.keys(socket.rooms)[0];
    socket.to(room).broadcast.emit('line', data);
  })
});

export default app

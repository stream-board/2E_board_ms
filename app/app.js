import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import express from './services/express'
import api from './api'
import initializeSocket from './sockets'

const app = express(apiRoot, api);
const server = http.createServer(app);

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
    initializeSocket(server)
  })
})

export default app

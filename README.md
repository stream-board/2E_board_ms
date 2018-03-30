# Board Microservice
Microservice in charge of the board signaling and turn managing. Built using ExpressJS, Redis and Socket.io

## Socket Events
* Connection
  ```
  io.on('connection', (socket)=>{...})
  ```
  Event triggered when a new Socket connects to the server. When it triggers it does the following sequence of events:
  * Get info sent in the connection URL
  * Check if the socket connected is the admin and assign the id of the socket to the room
  * Emit the 'admin' message to the client
  * Assign nickname to socket id
  * Join the socket to the desired room
* Disconnect
  ```
  socket.on('disconnect', () => {})
  ```
  Event triggered when a socket disconnects from the server. When it triggers it does the following sequence of events:
  * Check if the socket is the admin of the room
  * If the socket is the admin, the server disconnects everyone from the room and emits the message 'hostLeft' to everyone in the room
  * Remove the socket from the room
* Draw
  ```
  socket.on('draw', (data) => {})
  ```
  Event triggered when a user sends a drawing command. It has a type that defines the type of drawing and the data related to that command. It checks if the user that emmited the message is the one allowed to draw, if that's the case the server broadcasts a 'draw' message with the drawing command to every other socket in the room
* Ask for board
  ```
  socket.on('askForBoard', () => {})
  ```
  Event triggered when a user ask for permissions to draw in the board. It checks that the one emitting the message is not the admin of the room. If that's the case, the server emits the message 'askForBoard' to the admin of the room.
* Answer for board
  ```
  socket.on('answerForBoard', (data) => {})
  ```
  Event triggered when the admin of the room answers the request for permissions. It checks that the emitter is the admin of the room. After that it emits a 'answerForBoard' message to the user that requested the permission. If the answer is positive, then it assigns the new drawer to the room and emits a 'lostPermission' message to the last drawer. 
* Reset board
  ```
  socket.on('resetBoard', () => {})
  ```
  Event triggered when the admin of the room wants to reset the permission of the board and be the drawer again. It checks if the emitter is the admin and sets the admin as the drawer of the board. Then, it emits a 'resetBoard' message to the admin and a 'lostPermission' to the last drawer

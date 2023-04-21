import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  console.log('connected client: ' + socket.id)
  socket.on('new-data',(data) => {
    console.log(data)
    socket.broadcast.emit('casa-' + 2)
  })

  socket.emit('video', {})
})



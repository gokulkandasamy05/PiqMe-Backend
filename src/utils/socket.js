const socket = require('socket.io');

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: 'http://localhost:3001'
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinChat', ({ loggedinUserId, id }) => {
            let roomId = [loggedinUserId, id].sort().join('_')
            socket.join(roomId)
        })

        socket.on('sendMessage', ({ loggedinUserId, id, text }) => {
            let roomId = [loggedinUserId, id].sort().join('_')
            io.to(roomId).emit('messageReceived', { text, loggedinUserId })
        })
        socket.on('disconnect', () => { })
    })
}

module.exports = initializeSocket
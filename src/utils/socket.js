const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('../models/chat');

const getRoomId = (loggedinUserId, id) =>{
    return crypto.createHash('sha256').update([loggedinUserId, id].sort().join('_')).digest('hex')
}

const initializeSocket = (server) => {
    const io = socket(server, {
        path: "/socket.io",
        cors: {
            origin: 'https://piqme.live',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinChat', ({ loggedinUserId, id }) => {
            let roomId = getRoomId(loggedinUserId, id)
            socket.join(roomId)
        })

        socket.on('sendMessage', async ({ loggedinUserId, id, text }) => {
            let roomId = getRoomId(loggedinUserId, id)

            try{
                let chat = await Chat.findOne({
                    participants: { $all: [loggedinUserId, id]}
                })

                if(!chat){
                    chat = await new Chat({
                        participants: [loggedinUserId, id],
                        messages: []
                    })
                }

                chat.messages.push({
                    sender: loggedinUserId,
                    text
                })

                await chat.save()
                io.to(roomId).emit('messageReceived', { text, loggedinUserId })
            }catch(err){
                console.log(err)
            }   
        })
        
        socket.on('disconnect', () => { })
    })
}

module.exports = initializeSocket
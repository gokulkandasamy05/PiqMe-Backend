const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('../models/chat');

const getRoomId = (loggedinUserId, id) =>{
    return crypto.createHash('sha256').update([loggedinUserId, id].sort().join('_')).digest('hex')
}

const initializeSocket = (server) => {
    const io = socket(server, {
        path: "/socket.io", // ✅ Explicit path
        cors: {
            origin: ['http://localhost:3001', 'https://piqme.live'],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New socket connected:', socket.id);

        socket.on('joinChat', ({ loggedinUserId, id }) => {
            if (!loggedinUserId || !id) return;
            const roomId = getRoomId(loggedinUserId, id);
            socket.join(roomId);
            console.log(`✅ User ${loggedinUserId} joined room ${roomId}`);
        });

        socket.on('sendMessage', async ({ loggedinUserId, id, text }) => {
            if (!loggedinUserId || !id || !text?.trim()) return;

            const roomId = getRoomId(loggedinUserId, id);
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [loggedinUserId, id] }
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [loggedinUserId, id],
                        messages: []
                    });
                }

                chat.messages.push({
                    sender: loggedinUserId,
                    text: text.trim()
                });

                await chat.save();
                io.to(roomId).emit('messageReceived', { text, loggedinUserId });
            } catch (err) {
                console.error("❌ Message save failed:", err);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected:', socket.id);
        });
    });
};

module.exports = initializeSocket

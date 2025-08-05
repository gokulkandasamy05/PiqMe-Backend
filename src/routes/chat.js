const express = require('express')
const { userAuth } = require('../middlewares/auth')
const Chat = require('../models/chat')
const chatRouter = express.Router()

chatRouter.get('/getChat/:id', userAuth, async (req, res) => {
    try {
        const id = req.params?.id
        const loginUserId = req?.user?._id

        const chats = await Chat.findOne({
            $or: [
                { participants: [loginUserId, id] },
                { participants: [id, loginUserId] },
            ]
        })

        res.json({
            status: true,
            data: chats?.messages || []
        })
    } catch (err) {
        return res.status(400).send(err?.message)
    }
})

module.exports = chatRouter
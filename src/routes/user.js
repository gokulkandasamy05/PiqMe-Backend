const express = require('express')
const { userAuth } = require('../middlewares/auth')
const connectionRequest = require('../models/connnectionRequest')
const User = require('../models/user')
const userRouter = express.Router()


userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedinUser = req.user
        const getAllConnections = await connectionRequest.find({
            $or: [
                { fromUserId: loggedinUser?._id, status: 'accepted' },
                { toUserId: loggedinUser?._id, status: 'accepted' }
            ]
        }).populate('fromUserId', ['firstName', 'lastName','about', 'age', 'gender','image']).populate('toUserId', ['firstName', 'lastName','about', 'age', 'gender','image'])
        
        const data = getAllConnections.map(row => {
            if (row?.fromUserId?._id.toString() === loggedinUser?._id.toString()) {
                return {toUserId: row?.toUserId}
            }
            return {fromUserId: row?.fromUserId}
        })


        res.json({
            status: true,
            data: data
        })
    } catch (err) {
        return res.status(400).send(err?.message)
    }
})


userRouter.get('/user/requests', userAuth, async (req, res) => {
    try {
        const loggedinUser = req.user
        const getAllRequests = await connectionRequest.find({ toUserId: loggedinUser?._id, status: 'interested' }).populate('fromUserId', ['firstName', 'lastName','about', 'age', 'gender','image'])
        res.json({
            status: true,
            data: getAllRequests
        })
    } catch (err) {
        return res.status(400).send(err?.message)
    }
})



userRouter.get('/user/feed', userAuth, async (req, res) => {
    try {
        const loggedinUser = req.user

        const getAllconections = await connectionRequest.find({
            $or:[
                {fromUserId: loggedinUser?._id},
                {toUserId: loggedinUser?._id}
            ]
        }).select('fromUserId toUserId')

        const hideUsersFromFeed = new Set()
        getAllconections.forEach(row =>{
            hideUsersFromFeed.add(row?.fromUserId.toString())
            hideUsersFromFeed.add(row?.toUserId.toString())
        })


        const users = await User.find({
            $and:[
                {_id: {$nin: Array.from(hideUsersFromFeed)}},
                {_id: {$ne: loggedinUser?._id}},
            ]
        }).select('firstName lastName image age about gender').limit(30)

        res.json({
            status: true,
            data: users
        })


    } catch (err) {
        return res.status(400).send(err?.message)
    }
})

module.exports = userRouter
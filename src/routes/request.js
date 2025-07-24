const express = require('express')
const ConnectionRequest = require('../models/connnectionRequest')
const { userAuth } = require('../middlewares/auth')
const User = require('../models/user')

const requestRouter = express.Router()



requestRouter.post('/request/send/:status/:userId', userAuth, async (req, res) => {
  try {
    const status = req.params?.status
    const toUserId = req.params?.userId
    const fromUserId = req?.user?._id

    if (fromUserId.equals(toUserId)) {
      return res.json({
        status: false,
        message: 'Invalid request'
      })
    }


    const isUserExist = await User.findById(toUserId)
    if (!isUserExist) {
      return res.json({
        status: false,
        message: 'Sending request to the user is not exist'
      })
    }


    const allowedStatus = ['ignored', 'interested']
    if (!allowedStatus.includes(status)) {
      return res.json({
        status: false,
        message: 'Invalid status'
      })
    }


    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    })
    if (existingConnectionRequest) {
      return res.json({
        status: false,
        message: 'Request already sent'
      })
    }



    const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status })
    const data = await connectionRequest.save()

    res.json({
      status: true,
      data: data,
      message: 'Connection send successfully'
    })
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})



requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const {requestId, status} = req.params
    const loggedinUser = req?.user


    const allowedStatus = ['accepted', 'rejected']
    if (!allowedStatus.includes(status)) {
      return res.json({
        status: false,
        message: 'Invalid status'
      })
    }


    const getConnectionRequest = await ConnectionRequest.findOne({ _id: requestId, toUserId: loggedinUser?._id, status: "interested" })
    
    if(!getConnectionRequest){
      return res.json({status: false, message: "Connection request not found"})
    }

    getConnectionRequest.status = status
    await getConnectionRequest.save()

    res.json({
      status: true,
      data: getConnectionRequest,
      message: 'Connection request ' + status
    })
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})



module.exports = requestRouter
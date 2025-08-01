const express = require('express')
const ConnectionRequest = require('../models/connnectionRequest')
const { userAuth } = require('../middlewares/auth')
const User = require('../models/user')
const sendEmail = require('../utils/sendEmail')
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
    const { firstName, lastName, emailId, image } = req?.user

    const subject = `${isUserExist?.firstName} ${isUserExist?.lastName} sends you a connection request`
    const htmlBody = `<html>
  <head>
    <style>
      .card {
        width: 360px;
        margin: auto;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: Arial, sans-serif;
      }
      .card img {
        width: 100%;
        height: auto;
      }
      .card-content {
        padding: 16px;
      }
      .card-content h2 {
        margin: 0 0 10px 0;
      }
      .card-content p {
        color: #444;
      }
      .btn {
        display: inline-block;
        margin-top: 12px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello! ${firstName} ${lastName}</h1>
      <img width="150" height="150" src="https://piqme.live/api/uploads/${image?.filename}" alt="Image" />
      <div class="card-content">
        <a href="https://piqme.live/connections" class="btn">View on PiqMe</a>
      </div>
    </div>
  </body>
</ html>`


    const toEmailId = isUserExist?.emailId
    const sendEmailRes = await sendEmail.run(subject, htmlBody, toEmailId)

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
    const { requestId, status } = req.params
    const loggedinUser = req?.user


    const allowedStatus = ['accepted', 'rejected']
    if (!allowedStatus.includes(status)) {
      return res.json({
        status: false,
        message: 'Invalid status'
      })
    }


    const getConnectionRequest = await ConnectionRequest.findOne({ _id: requestId, toUserId: loggedinUser?._id, status: "interested" })

    if (!getConnectionRequest) {
      return res.json({ status: false, message: "Connection request not found" })
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
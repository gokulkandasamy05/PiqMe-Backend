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
    <meta charset="UTF-8" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f6f9fc;
        font-family: Arial, sans-serif;
      }

      .email-wrapper {
        width: 100%;
        padding: 40px 0;
        background-color: #f6f9fc;
      }

      .card {
        max-width: 400px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      .card-header {
        background-color: #e60076;
        padding: 16px;
        color: #ffffff;
        font-size: 20px;
      }

      .card img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 50%;
        margin-top: 20px;
      }

      .card-content {
        padding: 20px;
      }

      .card-content p {
        margin: 10px 0;
        color: #333;
        font-size: 16px;
      }

      .btn {
        display: inline-block;
        margin-top: 16px;
        padding: 12px 28px;
        background: #e60076;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: bold;
        border-radius: 30px;
        font-size: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: background 0.3s ease;
      }


      @media only screen and (max-width: 480px) {
        .card {
          margin: 10px;
        }
      }
    </style>
  </head>

  <body>
    <div class="email-wrapper">
      <div class="card">
        <div class="card-header">
          You've received a connection request!
        </div>
        <img src="https://piqme.live/api/uploads/${image?.filename}" alt="User Image" />
        <div class="card-content">
          <p><strong>${firstName} ${lastName}</strong> wants to connect with you.</p>
          <a href="https://piqme.live/connections" class="btn">View on PiqMe</a>
        </div>
      </div>
    </div>
  </body>
</html>`


    const toEmailId = isUserExist?.emailId
    const sendEmailRes = await sendEmail.run(subject, htmlBody, toEmailId, emailId)
    console.log(sendEmailRes);
    
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
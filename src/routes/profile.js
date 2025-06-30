const express = require('express')
const profileRouter = express.Router()
const { userAuth } = require('../middlewares/auth')

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user
    if (user) {
      res.send(user)
    } else {
      res.status(400).send('User not found')
    }
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})


module.exports = profileRouter
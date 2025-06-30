const express = require('express');
const authRouter = express.Router();
const { validateSignupData } = require('../utils/validateSignupData')
const User = require('../models/user')
const bcrypt = require('bcrypt')


authRouter.post('/signUp', async (req, res) => {
  try {
    validateSignupData(req.body)
    const { firstName, lastName, emailId, password } = req.body
    const bcryptPassword = await bcrypt.hash(password, 10)

    const user = new User({ firstName, lastName, emailId, password: bcryptPassword })
    await user.save()
    res.send('Success')
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})



authRouter.post('/login', async (req, res) => {
  try {

    const body = req.body
    const { emailId, password } = body

    const isUserExist = await User.findOne({ emailId })
    if (!isUserExist) {
      return res.status(400).send('Invalid Credentials')
    }
    
    const comparePassword = await isUserExist.validatePassword(password)
    if (comparePassword) {

      const token = await isUserExist.getJwtToken();

      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000) 
      })
      res.status(200).send('User logged in successfully')
    } else {
      res.status(400).send('Invalid Credentials')
    }

  } catch (err) {
    return res.status(400).send(err?.message)
  }
})


module.exports = authRouter;

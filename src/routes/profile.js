const express = require('express')
const profileRouter = express.Router()
const { userAuth } = require('../middlewares/auth')
const User = require('../models/user')
const { validateProfileData, validatePassword } = require('../utils/validate')
const bcrypt = require('bcrypt');
const validator = require('validator');
const { upload } = require('../utils/fileUpload')

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user
    if (user) {
      res.json({
        status: true,
        data: user
      })
    } else {
      res.json({
        status: false,
        message: 'User not found'
      })
    }
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})


profileRouter.patch('/profile/edit', userAuth, upload.single('image'), async (req, res) => {

  try {
    if (!validateProfileData(req)) {
      return res.status(400).send('Invalid Edit Request')
    }

    const user = req.user
    const body = req.body
    if (body) {
      const data = {...body}
      if(req?.file){
        data['image'] = req?.file
      }
      const response = await User.findByIdAndUpdate(user?._id, {...data})
      res.json({
        status: true,
        data: response,
        message: 'Updated Successfully'
      })
    }
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})


profileRouter.patch('/profile/password', userAuth, async (req, res) => {
  try {
    if (validatePassword(req)) {
      const user = req.user
      const { currentPassword, newPassword } = req.body


      const confirmPassword = await user.validatePassword(currentPassword)
      if (confirmPassword) {

        if (!validator.isStrongPassword(newPassword)) {
          return res.json({
            status: false,
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol'
          })
        }


        const checkPasswordAlreadyused = await user.validatePassword(newPassword)

        if (checkPasswordAlreadyused) {
          return res.json({
            status: false,
            message: 'New password alredy used, try different password'
          })
        }



        const bcryptPassword = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(user?._id, { password: bcryptPassword })
        res.json({
          status: true,
          message: 'Password updated successfully'
        })
      } else {
        res.send({
          status: false,
          message: 'Current password is wrong'
        })
      }
    }
  } catch (err) {
    return res.status(400).send(err?.message)
  }
})


module.exports = profileRouter
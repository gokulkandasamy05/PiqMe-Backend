const express = require('express');
const authRouter = express.Router();
const { validateSignupData } = require('../utils/validate')
const User = require('../models/user')
const bcrypt = require('bcrypt');
const { userAuth } = require('../middlewares/auth');


authRouter.post('/signUp', async (req, res) => {
    try {
        validateSignupData(req.body)
        const { firstName, lastName, emailId, password, image } = req.body
        const bcryptPassword = await bcrypt.hash(password, 10)

        const user = new User({ firstName, lastName, emailId, image, password: bcryptPassword })
        await user.save()
        res.json({
            status: true,
            message: 'Signed up in successfully'
        })
    } catch (err) {
        console.log(err)
        return res.json({
                status: false,
                message: err
            })
        return res.status(400).send(err?.message)
    }
})



authRouter.post('/login', async (req, res) => {
    try {

        const body = req.body
        const { emailId, password } = body

        const isUserExist = await User.findOne({ emailId })
        if (!isUserExist) {
            return res.json({
                status: false,
                message: 'Invalid Credentials'
            })
        }

        const comparePassword = await isUserExist.validatePassword(password)
        if (comparePassword) {

            const token = await isUserExist.getJwtToken();

            const sendData = isUserExist?._doc

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 8 * 3600000,
            });
            res.json({
                status: true,
                message: 'Logged in successfully',
                data: {
                    _id: sendData?._id,
                    firstName: sendData?.firstName,
                    lastName: sendData?.lastName,
                    emailId: sendData?.emailId,
                    image: sendData?.image,
                    about: sendData?.about,
                    age: sendData?.age,
                    gender: sendData?.gender,
                }
            })
        } else {
            res.json({
                status: false,
                message: 'Invalid Credentials'
            })
        }

    } catch (err) {
        return res.status(400).send(err?.message)
    }
})



authRouter.post('/logout', async (req, res) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now())
        })
        res.json({
            status: true,
            message: 'Logged out successfully'
        })
    } catch (err) {
        return res.status(400).send(err?.message)
    }
})


module.exports = authRouter;

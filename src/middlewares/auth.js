const User = require('../models/user');
const jwt = require('jsonwebtoken');


const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies
        if (token) {
            const decoded = await jwt.verify(token, 'qwerty$1234');
            const { _id } = decoded
            if (_id) {
                const user = await User.findById(_id);
                if (user) {
                    req.user = user
                    next()
                } else {
                    res.json({
                        status: false,
                        message: 'User not found'
                    })
                }
            }
        } else {
            return res.json({
                status: false,
                message: 'Unauthorized access, please login'
            })
        }
    } catch (err) {
        return res.status(400).send(err?.message)
    }
}


module.exports = { userAuth };
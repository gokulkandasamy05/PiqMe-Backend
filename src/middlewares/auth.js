const User = require('../models/user');
const jwt = require('jsonwebtoken');


const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies
        if (token) {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
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
            return res.status(501).json({
                status: false,
                logout: true,
                message: 'Unauthorized access, please login'
            })
        }
    } catch (err) {
        return res.status(400).send(err?.message)
    }
}


module.exports = { userAuth };
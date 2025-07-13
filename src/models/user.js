const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email ID')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})


userSchema.methods.validatePassword = async function(enteredPassword) {
    const user = this
    if(user){
        let isValidPassword = await bcrypt.compare(enteredPassword, user?.password)
        return isValidPassword
    }
    return false
}

userSchema.methods.getJwtToken = async function() {
    const user = this
    const token = await jwt.sign({ _id: user?._id }, 'qwerty$1234', { expiresIn: 60 * 36000 })
    return token
}


const User = mongoose.model('User', userSchema);
module.exports = User
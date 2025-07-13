const validator = require('validator');

const validateSignupData = (data) => {
    const { firstName, lastName, emailId, password } = data;
    if (!firstName || !lastName) {
        throw new Error('Name is not valid')
    } else if (!validator.isEmail(emailId)) {
        throw new Error('Invalid Email ID')
    } else if (!validator.isStrongPassword(password)) {
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol')
    }
}


const validateProfileData = (req) => {
    try {
        const allowedFields = ['firstName', 'lastName']
        const body = req.body

        const { firstName, lastName } = body;
        if (!firstName || !lastName) {
            throw new Error('Name is required')
        }
        if (!validator.isLength(firstName, { min: 3, max: 30 })) {
            throw new Error('First Name should be min 3 characters and max 30 characters')
        }

        let isAllowed = Object.keys(body).every(field => allowedFields.includes(field))
        return isAllowed
    } catch (err) {
        throw new Error(err)
    }
}


const validatePassword = (req) =>{
    try{
        const body = req.body
        const {currentPassword, newPassword} = body
        if(!currentPassword){
            throw new Error('Current password is required')
        }

        if(!newPassword){
            throw new Error('New password is required')
        }

        return true
    }catch(err){
        throw new Error(err)
    }
}


module.exports = { validateSignupData, validateProfileData, validatePassword }
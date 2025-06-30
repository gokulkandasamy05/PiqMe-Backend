const validator = require('validator');

const validateSignupData = (data) => {
    const { firstName, lastName, emailId, password } = data;
    if(!firstName  ||  !lastName) {
       throw new Error('Name is not valid')
    }else if(!validator.isEmail(emailId)) {
        throw new Error('Invalid Email ID')
    }else if(!validator.isStrongPassword(password)){
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol')
    }
}


module.exports = {validateSignupData}
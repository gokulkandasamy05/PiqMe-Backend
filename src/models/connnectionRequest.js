const mongoose = require('mongoose')

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['ignored', 'interested', 'accepted', 'rejected'],
            message: `{VALUE} is Invalid status`
        }
    }
},{
    timestamps: true
})


// connectionRequestSchema.pre('save', function(next) {
//   const user = this
//   console.log(user)
//   if(user.fromUserId.equals(user.toUserId)){
//     throw new Error('Invalid request')
//   }
//   next();
// });


const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema)
module.exports = ConnectionRequest
const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://gokulkandasamyy:Mechatron27@cluster0.sd5cn.mongodb.net/DevTinder')
}
module.exports = connectDB;

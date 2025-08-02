const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(`mongodb+srv://gokulkandasamyy:${process.env.MONGO_DB_PASSWORD}@cluster0.sd5cn.mongodb.net/DevTinder`)
}
module.exports = connectDB;

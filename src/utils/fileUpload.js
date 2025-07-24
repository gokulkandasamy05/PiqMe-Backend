const multer = require('multer');
const path = require('path');


// Set storage location and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 169123-file.png
    }
});


// Set upload limits (e.g., max file size = 5MB)
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports ={upload}
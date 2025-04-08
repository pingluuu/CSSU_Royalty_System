const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, req.user.utorid + path.extname(file.originalname));
    }
});

const upload = multer({

    storage: storage,

    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        console.log('File type:', file.mimetype);
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            console.log('File uploaded successfully');
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'));
            console.log('File upload failed');
        }
    }
});

module.exports = upload;

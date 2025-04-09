const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');
const { requireClearance } = require('../middleware/authMiddleware');


app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));
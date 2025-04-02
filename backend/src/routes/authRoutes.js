const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to authenticate user and generate JWT token
router.post('/tokens', authController.authenticate);

router.post('/resets/:resetToken', authController.resetPassword);

router.post('/resets', authController.requestPasswordReset);


module.exports = router;

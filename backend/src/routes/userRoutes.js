const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {requireClearance, authenticate} = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// POST /users → Register a new user (Cashier or higher)
router.post('/', authenticate, requireClearance('cashier'), userController.createUser);

// GET /users → Get users (Manager or higher)
router.get('/', authenticate, requireClearance('manager'), userController.getUsers);

// GET /users/me → Get current logged-in user's info (Regular or higher)
router.get('/me', authenticate, requireClearance('regular'), userController.getCurrentUser);

// PATCH /users/me → Update the current logged-in user's information (Regular or higher)
router.patch('/me', authenticate, requireClearance('regular'), userController.updateCurrentUser);

// PATCH request to update current logged-in user's password
router.patch('/me/password', authenticate, requireClearance('regular'), userController.updatePassword);

// GET /users/:userId → Retrieve a specific user (Cashier or higher)
router.get('/:userId', authenticate, requireClearance('cashier'), userController.getUserById);

// PATCH request to update user data
router.patch('/:userId', authenticate, requireClearance('manager'), userController.updateUser);

router.post('/me/transactions', authenticate, requireClearance('regular'), userController.redeemPoints);

router.post('/:userId/transactions', authenticate, requireClearance('regular'), userController.transferPoints);

router.get('/:userId/transactions', authenticate, requireClearance('regular'), userController.getMyTransactions);

router.patch('/:transactionId/processed', authenticate, requireClearance('cashier'), userController.markTransactionProcessed);

module.exports = router;

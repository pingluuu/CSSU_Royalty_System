// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, requireClearance } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// POST /transactions
router.post('/', authenticate, requireClearance('cashier'), transactionController.createTransaction);

router.get('/', authenticate, requireClearance('manager'), transactionController.getTransactions);

// GET /transactions/:transactionId
router.get('/:transactionId', authenticate, requireClearance('manager'), transactionController.getTransactionById);

router.patch('/:transactionId/suspicious', authenticate, requireClearance('manager'), transactionController.updateSuspiciousFlag);

router.patch('/:transactionId/processed', authenticate, requireClearance('cashier'), transactionController.processTransaction);
module.exports = router;
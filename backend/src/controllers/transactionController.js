// src/controllers/transactionController.js
const transactionService = require('../services/transactionService');

const createTransaction = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;
    const transaction = await transactionService.createTransaction(payload, user);
    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const getTransactionById = async (req, res) => {
    const transactionId = parseInt(req.params.transactionId);
  
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
  
    try {
      const transaction = await transactionService.getTransactionById(transactionId);
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
  };

  const getTransactions = async (req, res) => {
    try {
      const result = await transactionService.getTransactions(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
  };

  const updateSuspiciousFlag = async (req, res) => {
    const transactionId = parseInt(req.params.transactionId);
    const { suspicious } = req.body;
  
    if (typeof suspicious !== 'boolean') {
      return res.status(400).json({ message: 'Suspicious must be a boolean' });
    }
  
    try {
      const updatedTransaction = await transactionService.updateSuspicious(transactionId, suspicious);
      return res.status(200).json(updatedTransaction);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
  };

  const processTransaction = async (req, res) => {
    const { transactionId } = req.params;
    const { processed } = req.body;
    const cashierUtorid = req.user.utorid;
  
    if (processed !== true) {
      return res.status(400).json({ message: 'Processed must be true' });
    }
  
    try {
      const result = await transactionService.processRedemptionTransaction(transactionId, cashierUtorid);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
  };

module.exports = { createTransaction, getTransactionById, getTransactions, updateSuspiciousFlag, processTransaction };
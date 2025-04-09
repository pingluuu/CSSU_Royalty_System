const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { utorid, name, email } = req.body;

  // Validate payload
  if (!utorid || !name || !email) {
    return res.status(400).json({ error: 'UTORid, name, and email are required' });
  }

  try {
    const user = await userService.createUser(utorid, name, email);
    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes('Unique constraint failed')) {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      name: req.query.name,
      role: req.query.role,
      verified: req.query.verified,
      activated: req.query.activated,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    // Call the service function
    const result = await userService.getUsers(filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ error: error.error || "Internal server ERROR" });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json(
        {
          error: 'uid is not a number',
        }
      )
    }

    // Call the service function to get user details
    const user = await userService.getUserById(userId, req.user.role);

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return response with limited information for Cashier or higher
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  const userId = req.user.id; // Get the logged-in user's ID from the authenticated request

  try {
    // Call the service function to get the current user's information
    const user = await userService.getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user info as a response
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ error: error.error || "Internal server ERROR" });
  }
};


const updateUser = async (req, res) => {
  const { userId } = req.params; // Get the userId from URL parameters
  const { email, verified, suspicious, role } = req.body; // Get the data to update from request body
  const requestRole = req.user.role; // Get the role of the logged-in user

  try {
    // Call the service to update the user and get the updated data
    const updatedUser = await userService.updateUser(userId, { email, verified, suspicious, role }, requestRole);

    // Return the updated user fields
    return res.status(200).json(updatedUser);
  } catch (error) {
    // Handle errors and send appropriate response
    console.error(error);
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  const { old, new: newPassword } = req.body; // Get the old and new passwords
  const userId = req.user.id; // Get the logged-in user's ID from the request

  try {
    await userService.updatePassword(userId, old, newPassword);
    return res.status(200).send('Password updated successfully');
  } catch (error) {
    // Handle errors and send appropriate response
    console.error(error);
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, birthday } = req.body;

    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const updatedUser = await userService.updateCurrentUser(userId, {
      name,
      email,
      birthday,
      avatarUrl: avatar
    }, req.user);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};


const transferPoints = async (req, res) => {
  const sender = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      utorid: true,
      name: true,
      points: true,
      verified: true
    }
  });
  const recipientId = parseInt(req.params.userId);
  const { type, amount, remark } = req.body;

  try {
    const result = await userService.transferPoints(sender, recipientId, { type, amount, remark });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const redeemPoints = async (req, res) => {
  try {
    const user = req.user;
    const { type, amount, remark } = req.body;

    if (type !== 'redemption') {
      return res.status(400).json({ message: 'Invalid transaction type. Must be "redemption"' });
    }

    const result = await userService.redeemPoints(user, amount, remark);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = req.query;
    const result = await userService.getUserTransactions(userId, query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const markTransactionProcessed = async (req, res) => {
  const { transactionId } = req.params;
  const { processed } = req.body;
  const user = req.user;

  try {
    const result = await transactionService.markTransactionProcessed(transactionId, processed, user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const getAllEventsWithCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = req.query;
    const result = await userService.getEventsWithCurrUser(userId, query);
    return res.status(200).json(result);

  }

  catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }

}

module.exports = { createUser, getUsers, getUserById, getCurrentUser, updateUser, updatePassword, updateCurrentUser, transferPoints, redeemPoints, getMyTransactions, markTransactionProcessed, getAllEventsWithCurrentUser};

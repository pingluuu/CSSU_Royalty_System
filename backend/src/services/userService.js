const { PrismaClient, PromotionType, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();


const createUser = async (utorid, name, email) => {
  // Check for valid email format (utoronto.ca)
  if (!email.endsWith('@mail.utoronto.ca')) {
    throw new Error('Invalid email domain');
  }

  //Check for name not too long
  if (name.length > 50) {
    throw new Error('Name too long');
  }

  // Check for valid UTORid (8 alphanumeric characters)
  if (!/^[a-zA-Z0-9]{8}$/.test(utorid)) {
    throw new Error('UTORid must be 8 alphanumeric characters');
  }

  // Generate reset token and expiration time
  const resetToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Hash the default password
  const hashedPassword = await bcrypt.hash('defaultpassword', 10);

  // Create user in the database
  try {
    const user = await prisma.user.create({
      data: {
        utorid,
        name,
        email,
        password: hashedPassword, // Set default password
        resetToken,
        expiresAt,
        verified: false,
        role: 'regular', // Default role
      },
    });

    return {
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      verified: user.verified,
      expiresAt: user.expiresAt.toISOString(),
      resetToken: user.resetToken,
    };

  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Unique constraint failed');
    }
    throw error;
  }
};


const getUsers = async (filters) => {
  let { name, role, verified, activated, page = 1, limit = 10 } = filters;

  // Ensure page is a positive integer
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) {
    throw {
      status: 400,
      error: 'GET_ALL_USERS_PAGE_INVALID'
    };
  }

  if (isNaN(limit) || limit < 1) {
    throw {
      status: 400,
      error: 'GET_ALL_USERS_LIMIT_INVALID'
    };
  }

  const where = {};

  if (name) {
    where.OR = [
      { utorid: { contains: name } },
      { name: { contains: name } }
    ];
  }

  if (role) where.role = role.toLowerCase();

  if (verified !== undefined) where.verified = verified === 'true';

  if (activated !== undefined) {
    const isActivated = JSON.parse(activated.toLowerCase());
    where.lastLogin = isActivated ? { not: null } : null;
  }


  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [count, results] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        utorid: true,
        name: true,
        email: true,
        birthday: true,
        role: true,
        points: true,
        createdAt: true,
        lastLogin: true,
        verified: true,
        avatarUrl: true,
        suspicious: true
      }
    })
  ]);

  return {
    count,
    results: results.map(user => ({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      birthday: user.birthday || null, // Ensure null if not set
      role: user.role.toLowerCase(), // Convert to lowercase
      points: user.points,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      verified: user.verified,
      suspicious: user.suspicious, // Ensure null if not set
      avatarUrl: user.avatarUrl || null // Ensure null if not set
    }))
  };

};

const getUserById = async (userId, clearance) => {
  const hasPrivelege = clearance !== Role.cashier; // Check if the user has clearance to view sensitive data

  // Fetch the user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      promotions: {
        where: {
          type: 'one_time',
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
          users: { some: { id: userId } }
        },
        include: {
          transactions: {
            select: { transaction: { select: { userId: true } } }
          }
        }
      }
    }
  });

  // If no user is found, return a 404
  if (!user) {
    // return res.status(404).json({ error: 'User not found' });
    return null;
  }

  // Filter promotions: return only those not used by the user
  const availablePromotions = user.promotions.filter(promotion => {
    const usedByUser = promotion.transactions.some(
      tx => tx.transaction.userId === user.id
    );
    return !usedByUser;
  });

  // Return limited user info for cashiers
  const userInfo = {
    id: user.id,
    utorid: user.utorid,
    name: user.name,
    email: hasPrivelege ? user.email : undefined,
    birthday: hasPrivelege ? user.birthday : undefined,
    role: hasPrivelege ? user.role : undefined,
    points: user.points,
    createdAt: hasPrivelege ? user.createdAt : undefined,
    lastLogin: hasPrivelege ? user.lastLogin : undefined,
    verified: user.verified,
    avatarUrl: hasPrivelege ? user.avatarUrl : undefined,
    promotions: availablePromotions.map(promo => ({
      id: promo.id,
      name: promo.name,
      // description: promo.description,
      minSpending: promo.minSpending,
      rate: promo.rate,
      points: promo.points,
    })),
  };

  //   return res.status(200).json(userInfo);
  return userInfo;
};

const updateUser = async (userId, { email, verified, suspicious, role }, requestRole) => {
  // Check if there is any valid data in the payload
  if (!email && verified === undefined && suspicious === undefined && !role) {
    throw { status: 400, message: 'No fields to update' };
  }

  // Fetch the existing user
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  // Create the data object for updating
  const updateData = {};

  if (email && typeof email !== 'string') {
    throw { status: 400, message: 'Email must be a string' };
  }

  if (email) {
    // Check for valid email format (utoronto.ca)
    if (!email.endsWith('@mail.utoronto.ca')) {
      throw { status: 400, message: 'Invalid email domain' };
    }
    updateData.email = email;
  }

  if (verified !== undefined && typeof verified !== 'boolean' && verified !== null) {
    throw { status: 400, message: 'Verified must be a boolean' };
  }
  if (verified !== undefined && verified === false) {
    throw { status: 400, message: 'Can not un-verify a user' };
  }
  if (verified !== undefined && verified === true) {
    updateData.verified = verified;
  }

  if (suspicious != null || suspicious === false) {
    if (typeof suspicious !== 'boolean') {
      throw { status: 400, message: 'Suspicious must be a boolean' };
    }
    updateData.suspicious = suspicious;
  }

  if (role) {
    // Validate role based on the user's current role
    const validRoles = ['regular', 'cashier']; // Managers and higher can assign these roles
    const allRoles = ['regular', 'cashier', 'manager', 'superuser'];
    if (!allRoles.includes(role)) {
      throw { status: 400, message: 'Invalid role' };
    }
    const userRole = requestRole; // Get the role of the currently logged-in user (may be retrieved from the session/token)
    if (userRole === 'superuser') {
      validRoles.push('manager', 'superuser');
    }
    if (!validRoles.includes(role)) {
      throw { status: 403, message: 'Unauthorized role change' };
    }

    updateData.role = role;

  }

  // Update the user in the database
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData,
  });

  // Return the updated fields
  const response = {};
  // Add the user information (id, utorid, name) to the response
  response.id = updatedUser.id;
  response.utorid = updatedUser.utorid;
  response.name = updatedUser.name;

  // If promoting to cashier, set suspicious to false
  if (role === 'cashier' && updatedUser.suspicious) {
    updateData.suspicious = false;
  }

  for (const key in updateData) {
    response[key] = updatedUser[key];
  }

  return response;
};

const getCurrentUser = async (userId) => {
  try {
    // Fetch the current user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        promotions: {
          where: {
            endTime: { gte: new Date() }, // Only available promotions
          },
        },
      },
    });

    if (!user) {
      return null; // Return null if user is not found
    }

    // Prepare the response with relevant user info
    const response = {
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      verified: user.verified,
      avatarUrl: user.avatarUrl,
      promotions: user.promotions.map(promo => ({
        id: promo.id,
        name: promo.name,
        minSpending: promo.minSpending,
        rate: promo.rate,
        points: promo.points,
      })),
    };

    return response;
  } catch (error) {


  }
};

const validatePassword = (password) => {
  if (
    !password ||
    password.length < 8 ||
    password.length > 20 ||
    !/[A-Z]/.test(password) || // At least one uppercase letter
    !/[a-z]/.test(password) || // At least one lowercase letter
    !/[0-9]/.test(password) || // At least one number
    !/[^A-Za-z0-9]/.test(password) // At least one special character
  ) {
    throw {
      status: 400,
      error: 'Invalid password format'
    };
  }
};

const updatePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword) {
    throw { status: 400, message: 'UPDATE_MY_PASSWORD_MISSING_OLD_PASSWORD' };
  }

  if (!newPassword) {
    throw { status: 400, message: 'UPDATE_MY_PASSWORD_MISSING_NEW_PASSWORD' };
  }

  // Validate the new password format
  validatePassword(newPassword);

  // Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw {
      status: 404,
      error: 'User not Found'
    };
  }

  // Compare the old password with the stored hash
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw {
      status: 403,
      error: 'Incorrect current password'
    };
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password in the database
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const updateCurrentUser = async (userId, { name, email, birthday, avatarUrl }) => {

  if (!name && !email && !birthday && !avatarUrl) {
    throw { status: 400, message: 'No fields to update' };
  }

  const updateData = {};

  // Validate & update name
  if (name != null) {
    if (name.length < 1 || name.length > 50) {
      throw { status: 400, message: 'Name must be 1-50 characters' };
    }
    updateData.name = name;
  }

  // Validate & update email
  if (email != null) {
    if (!email.endsWith('@mail.utoronto.ca')) {
      throw { status: 400, message: 'Invalid email domain. Must be a UofT email' };
    }
    updateData.email = email;
  }

  // Validate & update birthday
  if (birthday !== undefined && birthday !== null) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthday)) {
      throw { status: 400, message: 'Invalid birthday format. Use YYYY-MM-DD' };
    }
    // Ensure the date is a valid date object
    const parsedBirthday = new Date(birthday);
    if (isNaN(parsedBirthday.getTime())) {
      throw { status: 400, message: 'Invalid birthday date' };
    }

    // Check if the date is valid (by comparing it to an invalid date)
    if (parsedBirthday.toString() === "Invalid Date") {
      throw { status: 400, message: 'Invalid birthday date' };
    }


    // Validate the day (e.g., reject February 31, April 31, etc.)
    const month = parsedBirthday.getMonth(); // 0-indexed (0 = January, 1 = February, etc.)
    const day = parsedBirthday.getDate();
    const expectedDate = new Date(parsedBirthday.getFullYear(), month, day);


    // Ensure the date string matches the parsed date (catches invalid days like Feb 31)
    if (parsedBirthday.toISOString().split("T")[0] !== birthday) {
      throw { status: 400, message: "Invalid birthday date, e.g., February 31 is not valid" };
    }

    updateData.birthday = birthday;
  }

  // Handle avatar upload
  if (avatarUrl) {
    updateData.avatarUrl = avatarUrl;
  }

  // Update user in database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });


  return {
    id: updatedUser.id,
    utorid: updatedUser.utorid,
    name: updatedUser.name,
    email: updatedUser.email,
    birthday: updatedUser.birthday,
    role: updatedUser.role,
    points: updatedUser.points,
    createdAt: updatedUser.createdAt,
    lastLogin: updatedUser.lastLogin,
    verified: updatedUser.verified,
    avatarUrl: updatedUser.avatarUrl
  };
};

const transferPoints = async (sender, recipientId, { type, amount, remark }) => {
  if (type !== 'transfer') {
    throw { status: 400, message: 'Invalid transaction type. Must be "transfer".' };
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw { status: 400, message: 'Amount must be a positive integer.' };
  }

  if (!sender.verified) {
    throw { status: 403, message: 'Sender is not verified.' };
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) {
    throw { status: 404, message: 'Recipient not found.' };
  }

  if (sender.points < amount) {
    throw { status: 400, message: 'Not enough points to complete the transfer.' };
  }

  const [sendTx, receiveTx] = await prisma.$transaction([
    // Deduct from sender
    prisma.transaction.create({
      data: {
        utorid: sender.utorid,
        userId: sender.id,
        type: 'transfer',
        amount: -amount,
        remark: remark || '',
        relatedId: recipient.id,
        createdBy: sender.utorid
      }
    }),

    // Credit to recipient
    prisma.transaction.create({
      data: {
        utorid: recipient.utorid,
        userId: recipient.id,
        type: 'transfer',
        amount: amount,
        remark: remark || '',
        relatedId: sender.id,
        createdBy: sender.utorid
      }
    }),

    // Update sender points
    prisma.user.update({
      where: { id: sender.id },
      data: { points: sender.points - amount }
    }),

    // Update recipient points
    prisma.user.update({
      where: { id: recipient.id },
      data: { points: recipient.points + amount }
    })
  ]);


  return {
    id: sendTx.id,
    sender: sender.utorid,
    recipient: recipient.utorid,
    type: sendTx.type,
    sent: amount,
    remark: remark || '',
    createdBy: sender.utorid
  };
};

const redeemPoints = async (user, amount, remark = '') => {
  // Validation
  if (!Number.isInteger(amount) || amount <= 0) {
    throw { status: 400, message: 'Amount must be a positive integer' };
  }

  // Fetch user's current points and verification status
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { points: true, verified: true, utorid: true }
  });

  if (!currentUser.verified) {
    throw { status: 403, message: 'User is not verified' };
  }

  if (currentUser.points < amount) {
    throw { status: 400, message: 'Not enough points to redeem' };
  }

  // Create redemption transaction (not processed yet)
  const transaction = await prisma.transaction.create({
    data: {
      utorid: user.utorid,
      userId: user.id,
      type: 'redemption',
      amount: -amount,
      createdBy: user.utorid,
      remark,
      processed: false
    }
  });

  return {
    id: transaction.id,
    utorid: user.utorid,
    type: transaction.type,
    processedBy: null,
    amount: -transaction.amount,
    remark: transaction.remark,
    createdBy: transaction.createdBy
  };
};

const getUserTransactions = async (userId, query) => {
  let {
    type,
    relatedId,
    promotionId,
    amount,
    operator,
    page = 1,
    limit = 10
  } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) throw { status: 400, message: 'Invalid page number' };
  if (isNaN(limit) || limit < 1) throw { status: 400, message: 'Invalid limit number' };

  const filters = { userId };

  if (type) filters.type = type;
  if (relatedId && type) filters.relatedId = parseInt(relatedId);
  if (promotionId) filters.promotions = { some: { promotionId: parseInt(promotionId) } };
  if (amount && operator && ['gte', 'lte'].includes(operator)) {
    filters.amount = { [operator]: parseInt(amount) };
  }

  const skip = (page - 1) * limit;
  const [count, transactions] = await Promise.all([
    prisma.transaction.count({ where: filters }),
    prisma.transaction.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        spent: true,
        amount: true,
        relatedId: true,
        remark: true,
        createdBy: true,
        promotions: {
          select: {
            promotionId: true
          }
        }
      }
    })
  ]);

  const results = transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    spent: tx.spent,
    amount: tx.amount,
    relatedId: tx.relatedId,
    promotionIds: tx.promotions.map(p => p.promotionId),
    remark: tx.remark,
    createdBy: tx.createdBy
  }));

  return { count, results };
};

const markTransactionProcessed = async (transactionId, processed, cashier) => {
  if (processed !== true) {
    throw { status: 400, message: 'Processed must be true' };
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: parseInt(transactionId) },
    include: { user: true }
  });

  if (!transaction) {
    throw { status: 404, message: 'Transaction not found' };
  }

  if (transaction.type !== 'redemption') {
    throw { status: 400, message: 'Only redemption transactions can be processed' };
  }

  if (transaction.processed) {
    throw { status: 400, message: 'Transaction has already been processed' };
  }

  // Deduct points from the user's balance
  const updatedUser = await prisma.user.update({
    where: { id: transaction.userId },
    data: {
      points: transaction.user.points - transaction.amount
    }
  });

  // Mark transaction as processed
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      processed: true,
      processedBy: cashier.utorid
    }
  });

  return {
    id: updatedTransaction.id,
    utorid: transaction.user.utorid,
    type: updatedTransaction.type,
    processedBy: updatedTransaction.processedBy,
    redeemed: transaction.amount,
    remark: updatedTransaction.remark,
    createdBy: updatedTransaction.createdBy
  };
};

module.exports = { createUser, getUsers, getUserById, updateUser, getCurrentUser, updatePassword, updateCurrentUser, transferPoints, redeemPoints, getUserTransactions, markTransactionProcessed };

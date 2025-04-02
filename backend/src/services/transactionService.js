// src/services/transactionService.js
const { PrismaClient, TransactionType, Status } = require('@prisma/client');
const prisma = new PrismaClient();

const createTransaction = async (payload, requestUser) => {
  const { utorid, type, spent, amount, relatedId, promotionIds = [], remark = '' } = payload;
  if (!utorid || !type) throw { status: 400, message: 'utorid and type are required' };

  const user = await prisma.user.findUnique({ where: { utorid: requestUser.utorid } });
  if (!user) throw { status: 404, message: 'User not found' };

  let data = {
    utorid,
    userId: user.id,
    type,
    remark,
    createdBy: requestUser.utorid,
    status: Status.completed,
    suspicious: user.suspicious
  };


  if (type === 'purchase') {
    if (typeof spent !== 'number' || spent <= 0) throw { status: 400, message: 'Invalid spent value' };
    data.spent = spent;

    amountToEarn = Math.round(spent / 0.25);
   
    data.amount = amountToEarn;

    // Check promotions if they exist
  if (promotionIds && promotionIds.length > 0) {
    // Ensure promotionIds is an array (handle single string case)
    const now = new Date();
    for (const promoId of promotionIds) {
      const promo = await prisma.promotion.findUnique({
        where: { id: promoId },
        include: { users: { where: { id: user.id } }, transactions: true }
      });

      console.log(promo);

      if (!promo || promo.startTime > now || promo.endTime < now) {
        throw { status: 400, message: `Invalid or expired promotion: ${promoId}` };
      }

      if (promo.minSpending && spent < promo.minSpending) {
        throw { status: 400, message: `Minimum spending not met: ${promoId}` };
      }

      console.log(user.promotions);

      if (promo.type === 'one_time' && promo.transactions.length > 0) {
        throw { status: 400, message: `One-time promotion already used: ${promoId}` };
      }
      console.log(promo.transactions.length);

      if (promo.points) amountToEarn += promo.points;
      if (promo.rate) amountToEarn += Math.round(spent * 100 * promo.rate);


    }
  }

    
    data.promotions = {
      create: promotionIds ? promotionIds.map(id => ({ promotionId: id })) : []
    };

    data.earned = 0;
    if (!user.suspicious) {

      await prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: amountToEarn } }
      });
      data.earned = amountToEarn;
    } 

  } else if (type === 'adjustment') {
    console.log(payload, requestUser);
    if (typeof amount !== 'number') throw { status: 400, message: 'Amount must be a number' };
    if (!relatedId) throw { status: 400, message: 'relatedId is required for adjustment' };
    if (!utorid) throw { status: 400, message: 'utorid is required for adjustment' };
  
    if (requestUser.role !== 'manager' && requestUser.role !== "superuser") {
      throw { status: 403, message: 'Only managers can make adjustments' };
    }

    const relatedTx = await prisma.transaction.findUnique({
      where: { id: relatedId }
    });
    if (!relatedTx) throw { status: 404, message: 'Related transaction not found' };
  
    // Fetch the target user to adjust
    const targetUser = await prisma.user.findUnique({ where: { utorid } });
    if (!targetUser) {
      throw { status: 404, message: 'User not found' };
    }
  
    // Apply the points update to the target user
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { points: targetUser.points + amount }
    });

    
    // Prepare transaction data
    data.userId = targetUser.id;
    data.utorid = utorid;
    data.amount = amount;
    data.relatedId = relatedId;
    data.promotions = {
      create: promotionIds ? promotionIds.map(id => ({ promotionId: id })) : []
    };
  } else {
    throw { status: 400, message: 'Invalid transaction type' };
  }

  const created = await prisma.transaction.create({
    data,
    include: { promotions: true }
  });


  return {
    id: created.id,
    utorid: created.utorid,
    type: created.type,
    relatedId: relatedId,
    spent: created.spent,
    amount: created.amount,
    earned: created.earned,
    remark: created.remark,
    promotionIds: Array.isArray(promotionIds) ? promotionIds : [],
    createdBy: created.createdBy
  };
};

const getTransactionById = async (transactionId) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        promotions: true,
      },
    });
  
    if (!transaction) {
      throw { status: 404, message: 'Transaction not found' };
    }
  
    return {
      id: transaction.id,
      utorid: transaction.utorid,
      type: transaction.type,
      spent: transaction.spent || undefined,
      amount: transaction.amount,
      promotionIds: transaction.promotions.map(p => p.promotionId),
      suspicious: transaction.suspicious,
      remark: transaction.remark || '',
      createdBy: transaction.createdBy,
      relatedId: transaction.relatedId,
    };
  };

  const getTransactions = async (filters) => {
    let {
      name,
      createdBy,
      suspicious,
      promotionId,
      type,
      relatedId,
      amount,
      operator,
      page = 1,
      limit = 10,
    } = filters;
  
    page = parseInt(page);
    limit = parseInt(limit);
  
    if (isNaN(page) || page < 1) throw { status: 400, message: 'Invalid page' };
    if (isNaN(limit) || limit < 1) throw { status: 400, message: 'Invalid limit' };
  
    const where = {};
  
    if (name) {
      where.user = {
        OR: [
          { utorid: { contains: name } },
          { name: { contains: name } },
        ]
      };
    }
  
    if (createdBy) where.createdBy = createdBy;
    if (suspicious !== undefined) where.suspicious = suspicious === 'true';
    if (promotionId) {
      where.promotions = {
        some: { promotionId: parseInt(promotionId) }
      };
    }
    if (type) where.type = type;
    if (relatedId && type) where.relatedId = parseInt(relatedId);
    if (amount && operator) {
      if (!['gte', 'lte'].includes(operator)) {
        throw { status: 400, message: 'Invalid operator' };
      }
      where.amount = { [operator]: parseInt(amount) };
    }
  
    const skip = (page - 1) * limit;
  
    const [count, results] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          promotions: true,
          user: true,
        },
      })
    ]);
  
    const formattedResults = results.map(tx => {
      return {
        id: tx.id,
        utorid: tx.utorid,
        amount: tx.amount,
        type: tx.type,
        spent: tx.spent,
        redeemed: tx.type === 'redemption' ? tx.amount * -1 : undefined,
        relatedId: tx.relatedId,
        promotionIds: tx.promotions.map(p => p.promotionId),
        suspicious: tx.suspicious,
        remark: tx.remark,
        createdBy: tx.createdBy,
      };
    });
  
    return { count, results: formattedResults };
  };

  const updateSuspicious = async (transactionId, suspiciousFlag) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });
  
    if (!transaction) {
      throw { status: 404, message: 'Transaction not found' };
    }
  
    // Determine updated points value
let updatedPoints = transaction.user.points;

if (transaction.suspicious !== suspiciousFlag) {
  updatedPoints = suspiciousFlag
    ? transaction.user.points - (transaction.earned || 0)  // Marking as suspicious → deduct
    : transaction.user.points + (transaction.earned || 0); // Marking as not suspicious → restore
}


    // Update transaction and user's points balance atomically
    const [updatedTransaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { suspicious: suspiciousFlag },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: { points: updatedPoints },
      }),
    ])
  
    const response = {
      id: updatedTransaction.id,
      utorid: transaction.utorid,
      type: updatedTransaction.type,
      spent: updatedTransaction.spent ?? undefined,
      promotionIds: await getPromotionIds(transactionId),
      suspicious: updatedTransaction.suspicious,
      remark: updatedTransaction.remark,
      createdBy: updatedTransaction.createdBy,
    };
    
    if (typeof updatedTransaction.earned === 'number') {
      response.amount = updatedTransaction.earned;
    }
    
    return response;
  };

  //helper function
  const getPromotionIds = async (transactionId) => {
    const relations = await prisma.transactionPromotion.findMany({
      where: { transactionId },
      select: { promotionId: true }
    });
  
    return relations.map(r => r.promotionId);
  };

  const processRedemptionTransaction = async (transactionId, cashierUtorid) => {
    const id = parseInt(transactionId);
if (isNaN(id)) {
  throw { status: 400, message: 'Invalid transaction ID' };
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
  
    // Deduct the amount from user's points
    const newPoints = transaction.user.points - transaction.amount;
    await prisma.user.update({
      where: { id: transaction.userId },
      data: { points: newPoints }
    });
  
    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        processed: true,
      },
      include: { user: true }
    });
  
    return {
      id: updated.id,
      utorid: updated.user.utorid,
      type: updated.type,
      processedBy: cashierUtorid,
      redeemed: updated.amount,
      remark: updated.remark || '',
      createdBy: updated.createdBy
    };
  };

module.exports = { createTransaction, getTransactionById, getTransactions, updateSuspicious, processRedemptionTransaction };

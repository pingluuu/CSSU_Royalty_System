// Import the PrismaClient
const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
const prisma = new PrismaClient();


/**
 * Create a new promotion
 * @param {Object} data - The promotion details
 * @returns {Object} - The created promotion
 */
const createPromotion = async ({ name, description, type, startTime, endTime, minSpending, rate, points }) => {
    // Validate type
    if (!name || !description || !type || !startTime || !endTime) {
        throw { status: 400, message: 'Missing required fields' };
    }
    
    if (!['automatic', 'one-time'].includes(type)) {
        throw { status: 400, message: 'Invalid promotion type. Must be either "automatic" or "one-time".' };
    }
    if (type === "one-time"){
        type = "one_time";
    }

    // Validate time
    const now = new Date().toISOString();
    if (startTime < now) {
        throw { status: 400, message: 'Start time must not be in the past.' };
    }
    if (endTime <= startTime) {
        throw { status: 400, message: 'End time must be after start time.' };
    }

    // Validate numbers
    if (minSpending !== undefined && minSpending !== null && (typeof minSpending !== 'number' || minSpending < 0)) {
        throw { status: 400, message: 'minSpending must be a positive number.' };
    }

    if (rate !== undefined && rate !== null && (typeof rate !== 'number' || rate < 0)) {
        throw { status: 400, message: 'Rate must be a positive number.' };
    }

    if (points !== undefined && (!Number.isInteger(points) || points < 0)) {
        throw { status: 400, message: 'Points must be a positive integer.' };
    }

    // Create promotion in the database
    const promotion = await prisma.promotion.create({
        data: { name, description, type, startTime, endTime, minSpending, rate, points },
    });

    return promotion;
};

const getPromotions = async (filters, clearance, req) => {
    const userId = parseInt(req.user.id)
    const hasPrivilege = clearance === "manager" || clearance === "superuser";
    let { name, type, page = 1, limit = 10, started, ended } = filters;

    // Ensure page is a positive integer
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
        throw {
            status: 400,
            error: 'GET_ALL_PROMOTIONS_PAGE_INVALID'
        };
    }

    if (isNaN(limit) || limit < 1) {
        throw {
            status: 400,
            error: 'GET_ALL_PROMOTIONS_LIMIT_INVALID'
        };
    }

    const where = {};

    // Filter by name if provided
    if (name) {
        where.name = {
            contains: name
        };
    }

    // Filter by type if provided (normalized to one_time)
    if (type) {
        where.type = type === 'one-time' ? 'one_time' : type;
    }

    if (hasPrivilege && started !== undefined && ended !== undefined) {
        throw { status: 400, error: 'GET_ALL_PROMOTIONS_STARTED_ENDED_CONFLICT' };
    }
    if (hasPrivilege) {
        // Apply 'started' filter if specified
        if (started !== undefined) {
            const now = new Date();
            where.startTime = started === 'true' ? { lte: now } : { gt: now };
        }

        // Apply 'ended' filter if specified
        if (ended !== undefined) {
            const now = new Date();
            where.endTime = ended === 'true' ? { lte: now } : { gt: now };
        }
    } else {
        // Regular users only see active promotions they haven't used
        const now = new Date();
        where.startTime = { lte: now };
        where.endTime = { gt: now };
        where.users = { none: { id: userId } }; // Ensure the user has not used the promotion
    }



    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Fetch promotions and count them
    const [count, results] = await Promise.all([
        prisma.promotion.count({ where }),
        prisma.promotion.findMany({
            where,
            skip,
            take,
            orderBy: { startTime: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                startTime: true,
                endTime: true,
                minSpending: true,
                rate: true,
                points: true
            }
        })
    ]);

    return {
        count,
        results: results.map(promotion => ({
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            startTime: hasPrivilege && promotion.startTime ? promotion.startTime.toISOString() : undefined,
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        }))
    };
};


const getPromotionById = async (promotionId, user) => {
    const now = new Date().toISOString();

    const filters = {
        ...((user.role === 'regular' || user.role === "cashier")&& { startTime: { lte: now }, endTime: { gt: now } }) // Only active promotions for regular users
    };

    const promotion = await prisma.promotion.findFirst({ where: 
        {id: parseInt(promotionId),
        ...filters  
    }
    });

    if (!promotion) {
        throw { status: 404, message: 'Promotion not found or inactive' };
    }

    return promotion;
};

const deletePromotion = async (promotionId) => {
    const id = parseInt(promotionId, 10);

    if (isNaN(id)) {
        throw { status: 400, message: 'Invalid promotion ID' };
    }

    const promotion = await prisma.promotion.findUnique({
        where: { id },
    });

    if (!promotion) {
        throw { status: 404, message: 'Promotion not found' };
    }

    const now = new Date();
    if (promotion.startTime <= now) {
        throw { status: 403, message: 'Cannot delete a promotion that has already started' };
    }

    await prisma.promotion.delete({ where: { id}});

    return;
};

const updatePromotion = async (promotionId, data) => {
    const promotion = await prisma.promotion.findUnique({
        where: { id: parseInt(promotionId, 10) },
    });

    if (!promotion) {
        throw { status: 404, message: 'Promotion not found' };
    }

    const now = new Date();
    const { name, description, type, startTime, endTime, minSpending, rate, points } = data;

    // Prevent updates if the original startTime has passed
    if (promotion.startTime <= now) {
        throw { status: 400, message: 'Cannot update a promotion after it has started' };
    }

    // Prevent updates to endTime if the original endTime has passed
    if (endTime != null && promotion.endTime <= now) {
        throw { status: 400, message: 'Cannot update endTime after promotion has ended' };
    }

    // Validate startTime and endTime
    if (startTime && new Date(startTime) < now) {
        throw { status: 400, message: 'Start time cannot be in the past' };
    }

    if (endTime && new Date(endTime) <= new Date(startTime || promotion.startTime)) {
        throw { status: 400, message: 'End time must be after start time' };
    }

    // Validate numerical fields
    if (minSpending != null && (isNaN(minSpending) || minSpending <= 0)) {
        throw { status: 400, message: 'minSpending must be a positive number' };
    }

    if (rate != null && (isNaN(rate) || rate <= 0)) {
        throw { status: 400, message: 'rate must be a positive number' };
    }

    if (points != null && (!Number.isInteger(points) || points < 0)) {
        throw { status: 400, message: 'points must be a positive integer' };
    }

    // Normalize type
    if (type && !['automatic', 'one-time'].includes(type)) {
        throw { status: 400, message: 'Invalid type' };
    }

    // Filter by type if provided (normalized to one_time)
    if (type && type === 'one-time') {
        type = 'one_time';
    }
    // Prepare updateData object dynamically
    const updateData = {};

    if (name !== undefined && name !== null) updateData.name = name;
    if (description !== undefined && description !== null) updateData.description = description;
    if (type !== undefined && type !== null) updateData.type = type;
    if (startTime !== undefined && startTime !== null) updateData.startTime = new Date(startTime);
    if (endTime !== undefined && endTime !== null) updateData.endTime = new Date(endTime);
    if (minSpending !== undefined && minSpending !== null) updateData.minSpending = minSpending;
    if (rate !== undefined && rate !== null) updateData.rate = rate;
    if (points !== undefined && points !== null) updateData.points = points;

    // Perform update only if updateData has fields to update
    const updatedPromotion = await prisma.promotion.update({
        where: { id: promotion.id },
        data: updateData,
    });

/*
    // Perform update
    const updatedPromotion = await prisma.promotion.update({
        where: { id: promotion.id },
        data: {
            name,
            description,
            type,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            minSpending,
            rate,
            points
        }
    });
    */

    // Prepare response: Always return id, name, type; return only updated fields
    const response = { id: updatedPromotion.id, name: updatedPromotion.name, type: updatedPromotion.type };
    if (name) response.name = updatedPromotion.name;
    if (description) response.description = updatedPromotion.description;
    if (type) response.type = updatedPromotion.type;
    if (startTime) response.startTime = updatedPromotion.startTime.toISOString();
    if (endTime) response.endTime = updatedPromotion.endTime.toISOString();
    if (minSpending !== undefined) response.minSpending = updatedPromotion.minSpending;
    if (rate !== undefined) response.rate = updatedPromotion.rate;
    if (points !== undefined) response.points = updatedPromotion.points;

    return response;

}

module.exports = { createPromotion, getPromotions, getPromotionById, deletePromotion, updatePromotion };

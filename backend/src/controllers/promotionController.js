const promotionService = require('../services/promotionService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
/**
 * Controller to create a new promotion
 */
const createPromotion = async (req, res) => {
    try {
        const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;

        const promotion = await promotionService.createPromotion({
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        });

        return res.status(201).json(promotion);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

const getPromotions = async (req, res) => {
    try {
        // Extract filters from query parameters
        const filters = {
            name: req.query.name,
            type: req.query.type,
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            started: req.query.started,
            ended: req.query.ended
        };

        // Call the service function
        const result = await promotionService.getPromotions(filters, req.user.role, req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.error || "Internal server error" });
    }
};



const getPromotionById = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const user = req.user; // User info from authentication middleware

        const promotion = await promotionService.getPromotionById(promotionId, user);

        return res.status(200).json(promotion);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;

        await promotionService.deletePromotion(promotionId);

        return res.status(204).send(); // No Content
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

const updatePromotion = async (req, res) => {  
    try{
        const { promotionId } = req.params;
        const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
        const promotion = await promotionService.updatePromotion(promotionId, {
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        });

        return res.status(200).json(promotion);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
}

module.exports = { createPromotion, getPromotions, getPromotionById, deletePromotion, getPromotions, updatePromotion };

const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, requireClearance } = require('../middleware/authMiddleware');

// POST /promotions → Create a new promotion (Manager or higher)
router.post('/', authenticate, requireClearance('manager'), promotionController.createPromotion);

router.get('/', authenticate, requireClearance('regular'), promotionController.getPromotions);

// GET /promotions/:promotionId → Retrieve a single promotion (Regular or higher)
router.get('/:promotionId', authenticate, requireClearance('regular'), promotionController.getPromotionById);

// DELETE /promotions/:promotionId → Remove a promotion (Manager or higher)
router.delete('/:promotionId', authenticate, requireClearance('manager'), promotionController.deletePromotion);

router.patch('/:promotionId', authenticate, requireClearance('manager'), promotionController.updatePromotion);

module.exports = router;

// eventsRouter.js
const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventController');
const { authenticate, requireClearance } = require('../middleware/authMiddleware');

// POST route for creating an event
router.post('/', authenticate, requireClearance('manager'), eventsController.createEvent);

router.get('/', authenticate, requireClearance('regular'), eventsController.getEvents);

// Route for getting a single event by its ID
router.get('/:eventId', authenticate, requireClearance('regular'), eventsController.getEventById);

router.post('/:eventId/organizers', authenticate, requireClearance('manager'), eventsController.addEventOrganizer);

// PATCH /events/:eventId
router.patch('/:eventId', authenticate, eventsController.updateEvent);

// DELETE /events/:eventId
router.delete('/:eventId', authenticate, requireClearance('manager'), eventsController.deleteEvent);

// DELETE /events/:eventId/guests/me
router.delete('/:eventId/guests/me', authenticate, eventsController.removeSelfFromEvent);

// DELETE /events//:eventId/organizers/:userId
router.delete('/:eventId/organizers/:userId', authenticate, requireClearance('manager'), eventsController.removeEventOrganizer);

router.post('/:eventId/guests', authenticate, eventsController.addEventGuest);

router.delete('/:eventId/guests/:userId', authenticate, requireClearance('manager'), eventsController.removeEventGuest);

router.post(
    '/:eventId/guests/me',
    authenticate,
    requireClearance('regular'), // Only regular users can RSVP themselves
    eventsController.rsvpToEvent
  );

// POST /events/:eventId/transactions
router.post(
  '/:eventId/transactions',
  authenticate,
  requireClearance('regular'), // Will verify in controller if manager or organizer
  eventsController.createEventTransaction
);

module.exports = router;

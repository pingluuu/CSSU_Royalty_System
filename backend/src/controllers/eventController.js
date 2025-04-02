// eventsController.js
const eventService = require('../services/eventService');
// src/prisma/client.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createEvent = async (req, res) => {
  try {
    const { name, description, location, startTime, endTime, capacity, points } = req.body;

    // Call the service to handle event creation
    const event = await eventService.createEvent({ name, description, location, startTime, endTime, capacity, points });

    // Respond with the created event
    return res.status(201).json({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      pointsRemain: event.pointsRemain,
      pointsAwarded: event.pointsAwarded,
      published: event.published,
      organizers: [],
      guests: [],
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {

  try {
      const events = await eventService.getEvents(req.user, req.query);
      return res.status(200).json(events);
  } catch (error) {
      console.error(error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
  }
};

const getEventById = async (req, res) => {

  const eventsId = parseInt(req.params.eventId);
  try {
        if (Number.isNaN(eventsId)) {
            return res.status(400).json(
                {
                    error: 'eventid is not a number',
                }
            )
        }
  const user = req.user; // Assuming user is attached to the request object after authentication
  
    // If user doesn't exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }
      const event = await eventService.getEventById(eventsId, user);
      return res.status(200).json(event);
  } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const addEventOrganizer = async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const { utorid } = req.body;

  if (!utorid) {
    return res.status(400).json({ message: 'utorid is required' });
  }

  try {
    const event = await eventService.addEventOrganizer(eventId, utorid);
    return res.status(201).json(event);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const updateEvent = async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const user = req.user;
  const updates = req.body;

  if (Number.isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const result = await eventService.updateEvent(eventId, user, updates);
    return res.status(200).json(result);
  } catch (error) {

    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const removeEventOrganizer = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    await eventService.removeEventOrganizer(eventId, userId);
    return res.status(204).send(); // No Content
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const addEventGuest = async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const { utorid } = req.body;
  const requestUser = req.user;

  if (!utorid) {
    return res.status(400).json({ message: 'utorid is required' });
  }

  try {
    const eventData = await eventService.addEventGuest(eventId, utorid, requestUser);
    return res.status(201).json(eventData);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const removeEventGuest = async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const userId = parseInt(req.params.userId);
  const requestUser = req.user;

  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid eventId or userId' });
  }

  try {
    await eventService.removeEventGuest(eventId, userId, requestUser);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const rsvpToEvent = async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const user = req.user;

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid eventId' });
  }

  try {
    const result = await eventService.rsvpToEvent(eventId, user);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const removeSelfFromEvent = async (req, res) => {
  const user = req.user;
  const eventId = parseInt(req.params.eventId);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    await eventService.removeSelfFromEvent(eventId, user.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const deleteEvent = async (req, res) => {
  const eventId = parseInt(req.params.eventId);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    await eventService.deleteEvent(eventId);
    return res.status(204).send();
  } catch (error) {
    console.log(error)
    return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
};

const createEventTransaction = async (req, res) => {
  const { eventId } = req.params;
  const { utorid, amount, type, remark } = req.body;
  const creator = req.user;

  try {
    console.log(parseInt(eventId),
    { utorid, amount, type },
    creator);
    const result = await eventService.createEventRewardTransaction(
      parseInt(eventId),
      { utorid, amount, type, remark },
      creator
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, addEventOrganizer, updateEvent, removeEventOrganizer, addEventGuest, removeEventGuest, rsvpToEvent, removeSelfFromEvent, deleteEvent, createEventTransaction };

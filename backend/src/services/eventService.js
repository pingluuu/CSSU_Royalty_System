// eventsService.js
// src/prisma/client.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const createEvent = async ({ name, description, location, startTime, endTime, capacity, points }) => {
  if (!name || !description || !location || !startTime || !endTime || !points) {
    throw { status: 400, message: 'All required fields must be provided.' };
  }
  
  // Validate the startTime and endTime
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if the date conversion is valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw { status: 400, message: 'Invalid startTime or endTime.' };
  }

  // Validate if startTime or endTime is in the past
  const currentTime = new Date();
  if (start < currentTime || end < currentTime) {
    throw { status: 400, message: 'startTime and endTime must not be in the past.' };
  }

  // Check if the startTime is before endTime
  if (typeof startTime !== 'string') {
    throw { status: 400, message: 'startTime must be a string.' };
  }

  if (typeof endTime !== 'string'){
    throw { status: 400, message: 'endTime must be a string.' };
  }

  if (typeof name !== 'string'){
    throw { status: 400, message: 'name must be a string.' };
  
  }

   if (typeof description !== 'string'){ 
    throw { status: 400, message: 'description must be a string.' };
    }

    if (typeof location !== 'string'){
    throw { status: 400, message: 'location must be a string.' };
    }


  if (new Date(startTime) >= new Date(endTime)) {
    throw { status: 400, message: 'endTime must be after startTime.' };
  }

  // Validate capacity if provided
  if (capacity != null && (typeof capacity !== 'number' || capacity <= 0)) {
    throw { status: 400, message: 'capacity must be a positive number or null if unlimited.' };
  }

  // Validate points
  if (typeof points !== 'number' || points <= 0) {
    throw { status: 400, message: 'points must be a positive integer.' };
  }

  // Create the new event in the database
  const event = await prisma.event.create({
    data: {
      name,
      description,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: capacity ?? null, // Allow capacity to be null
      pointsRemain: points,
      pointsAwarded: 0,
      published: false,
      organizers: {connect: []},
      guests: {connect: []},
      points,
    },
  });
  return event;
};

const getEvents = async (user, query) => {
  let { name, location, started, ended, showFull, page = 1, limit = 10, published } = query;

  // Validate pagination
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) throw { status: 400, error: 'GET_ALL_EVENTS_PAGE_INVALID' };
  if (isNaN(limit) || limit < 1) throw { status: 400, error: 'GET_ALL_EVENTS_LIMIT_INVALID' };

  // Reject conflicting filters
  if (started !== undefined && ended !== undefined) throw { status: 400, message: "Cannot specify both started and ended filters." };

  const now = new Date();
  const filters = {};

  if (name) filters.name = { contains: name };
  if (location) filters.location = { contains: location };
  if (started !== undefined) filters.startTime = started === 'true' ? { lte: now } : { gt: now };
  if (ended !== undefined) filters.endTime = ended === 'true' ? { lte: now } : { gt: now };

  // Published filter
  if (user.role === 'regular' || user.role === 'cashier') {
    filters.published = true;
  } else if (published !== undefined) {
    filters.published = published === 'true';
  }

  const skip = (page - 1) * limit;
  const take = limit;

  // Query events with organizers and guests
  const [count, events] = await Promise.all([
    prisma.event.count({ where: filters }),
    prisma.event.findMany({
      where: filters,
      skip,
      take,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        startTime: true,
        endTime: true,
        capacity: true,
        pointsRemain: user.role === 'manager' || user.role === 'superuser' ? true : false,
        pointsAwarded: user.role === 'manager' || user.role === 'superuser' ? true : false,
        published: user.role === 'manager' || user.role === 'superuser' ? true : false,
        organizers: {
          select: {
            user: {
              select: {
                id: true,
                utorid: true,
                name: true
              }
            }
          }
        },
        guests: {
          select: {
            user: {
              select: {
                id: true,
                utorid: true,
                name: true
              }
            }
          }
        }
      }
    })
  ]);

  // Format output
  const results = events.map(event => ({
    id: event.id,
    name: event.name,
    location: event.location,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    capacity: event.capacity,
    pointsRemain: event.pointsRemain,
    pointsAwarded: event.pointsAwarded,
    published: event.published,
    organizers: event.organizers.map(o => o.user),
    guests: user.role === 'manager' || user.role === 'superuser'
      ? event.guests.map(g => g.user)
      : undefined,
    numGuests: event.guests.length
  }));

  return { count, results };
};



const getEventById = async (eventId, user) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizers: {
        include: {
          user: {
            select: { id: true, utorid: true, name: true }
          }
        }
      },
      guests: {
        include: {
          user: {
            select: { id: true, utorid: true, name: true }
          }
        }
      }
    }
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  // Check if user is privileged (manager/superuser/organizer)
  const isPrivileged =
    user.role === 'manager' ||
    user.role === 'superuser' ||
    event.organizers.some(org => org.userId === user.id);

  if (!event.published && !isPrivileged) {
    throw { status: 404, message: 'Event not found' };
  }

  // Format organizers
  const organizers = event.organizers.map(org => org.user);

  if (isPrivileged) {
    const guests = event.guests.map(g => g.user);
    return {
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
      organizers,
      guests
    };
  } else {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      organizers,
      numGuests: event.guests.length
    };
  }
};

const addEventOrganizer = async (eventId, utorid) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: true },
  });

  if (!event) throw { status: 404, message: 'Event not found' };

  // 410 Gone if event already ended
  if (new Date(event.endTime) < new Date()) {
    throw { status: 410, message: 'Cannot add organizer to a past event' };
  }

  const user = await prisma.user.findUnique({
    where: { utorid },
  });

  if (!user) throw { status: 404, message: 'User not found' };

  // 400 Bad Request if user is a guest
  const isGuest = await prisma.eventGuest.findFirst({
    where: {
      eventId,
      userId: user.id,
    },
  });

  if (isGuest) {
    throw { status: 400, message: 'User is currently a guest. Remove them as guest before adding as organizer' };
  }

  // Check if already organizer (prevent duplicates)
  const existing = await prisma.eventOrganizer.findFirst({
    where: {
      eventId,
      userId: user.id,
    },
  });

  if (!existing) {
    await prisma.eventOrganizer.create({
      data: {
        eventId,
        userId: user.id,
      },
    });
  }

  // Get updated organizers
  const updatedOrganizers = await prisma.eventOrganizer.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, utorid: true, name: true },
      },
    },
  });

  return {
    id: event.id,
    name: event.name,
    location: event.location,
    organizers: updatedOrganizers.map(org => org.user),
  };
};

const updateEvent = async (eventId, user, payload) => {

  const {
    name,
    description,
    location,
    startTime,
    endTime,
    capacity,
    points,
    published
  } = payload;

  const now = new Date();
  // Reject if new startTime or endTime is in the past
if (startTime && new Date(startTime) < now) {
  throw { status: 400, message: 'startTime cannot be in the past' };
}
if (endTime && new Date(endTime) < now) {
  throw { status: 400, message: 'endTime cannot be in the past' };
}

  const event = await prisma.event.findUnique({
    where: { id: parseInt(eventId) },
    include: {
      guests: true
    }
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }


  const alreadyStarted = event.startTime <= now;
  const alreadyEnded = event.endTime <= now;

  // Validate immutable fields if event has started
  if (alreadyStarted && (name || description || location || startTime || capacity != null)) {
    throw { status: 400, message: 'Cannot update name, description, location, startTime or capacity after the event has started' };
  }

  if (alreadyEnded && endTime) {
    throw { status: 400, message: 'Cannot update endTime after the event has ended' };
  }

  // Validate points & published permissions

  const isManager = user.role === "manager" || user.role === "superuser";
  if ((points != null || published != null) && !isManager) {
    throw { status: 403, message: 'Only managers can update points or publish status' };
  }

  // Validate points
  if (points != null) {
    if (!Number.isInteger(points) || points < 0) {
      throw { status: 400, message: 'Points must be a positive integer' };
    }
    const delta = points - event.points;
    const newRemaining = event.pointsRemain + delta;
    if (newRemaining < 0) {
      throw { status: 400, message: 'Cannot reduce points below points already awarded' };
    }
  }

  // Validate capacity
  if (capacity != null) {
    if (typeof capacity !== 'number' || capacity <= 0) {
      throw { status: 400, message: 'Capacity must be a positive number or null' };
    }
    if (event.guests.length > capacity) {
      throw { status: 400, message: 'Cannot reduce capacity below current guest count' };
    }
  }

  // Validate startTime & endTime formats
  if (startTime && isNaN(new Date(startTime))) {
    throw { status: 400, message: 'Invalid start time format' };
  }
  if (endTime && isNaN(new Date(endTime))) {
    throw { status: 400, message: 'Invalid end time format' };
  }
  if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
    throw { status: 400, message: 'endTime must be after startTime' };
  }

  // Only allow published: true
  if (published != null && published !== true) {
    throw { status: 400, message: 'published can only be set to true' };
  }

  const updateData = {};
  if (name != null) updateData.name = name;
  if (description != null) updateData.description = description;
  if (location != null) updateData.location = location;
  if (startTime) updateData.startTime = new Date(startTime);
  if (endTime) updateData.endTime = new Date(endTime);
  if (capacity != null) updateData.capacity = capacity;
  if (points != null) {
    updateData.points = points;
    updateData.pointsRemain = event.pointsRemain + (points - event.points);
  }
  if (published === true) updateData.published = true;

  const updatedEvent = await prisma.event.update({
    where: { id: event.id },
    data: updateData
  });

  const response = {
    id: updatedEvent.id,
    name: updatedEvent.name,
    location: updatedEvent.location
  };
  for (const key of Object.keys(updateData)) {
    if (!['name', 'location'].includes(key)) {
      response[key] = updatedEvent[key];
    }
  }

  return response;
};


const removeEventOrganizer = async (eventId, userId) => {
  // Check if the organizer exists for the event
  const organizer = await prisma.eventOrganizer.findFirst({
    where: {
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    },
  });

  if (!organizer) {
    throw { status: 404, message: 'Organizer not found for this event' };
  }

  // Remove the organizer
  await prisma.eventOrganizer.delete({
    where: { id: organizer.id },
  });
};

const addEventGuest = async (eventId, utorid, requestUser) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(eventId) },
    include: {
      guests: true,
      organizers: true,
      _count: { select: { guests: true } }
    },
  });

  if (!event) throw { status: 404, message: 'Event not found' };

  const now = new Date();
  if (event.endTime <= now) throw { status: 410, message: 'Event has already ended' };

  if (event.capacity && event._count.guests >= event.capacity) {
    throw { status: 410, message: 'Event is full' };
  }

  const guestUser = await prisma.user.findUnique({
    where: { utorid: utorid },
  });
  if (!guestUser) {
    throw { status: 404, message: 'Users not found' };
  }

  // Check if user is already a guest of the event
  const existingGuest = await prisma.eventGuest.findFirst({
    where: {
      eventId: eventId,
      userId: guestUser.id,
    },
  });

  if (existingGuest) {
    throw { status: 400, message: 'User is already on the guest list' };
  }

  // If requester is organizer, ensure they can see this event
  const isOrganizer = await prisma.eventOrganizer.findFirst({
    where: {
      eventId: parseInt(eventId),
      userId: requestUser.id,
    },
  });

  const hasPrivilege =
    requestUser.role === 'manager' || requestUser.role === 'superuser' || isOrganizer;

  if (!hasPrivilege && !event.published) {
    throw { status: 404, message: 'Event is not visible to you yet' };
  }

  const user = await prisma.user.findUnique({ where: { utorid } });
  if (!user) throw { status: 404, message: 'User not found' };

  // Prevent adding organizer as guest
  const isAlsoOrganizer = await prisma.eventOrganizer.findFirst({
    where: {
      eventId: parseInt(eventId),
      userId: user.id,
    },
  });

  if (isAlsoOrganizer) {
    throw { status: 400, message: 'User is an organizer — remove as organizer first' };
  }

  // Add guest
  await prisma.eventGuest.create({
    data: {
      eventId: parseInt(eventId),
      userId: user.id,
    },
  });

  return {
    id: event.id,
    name: event.name,
    location: event.location,
    guestAdded: {
      id: user.id,
      utorid: user.utorid,
      name: user.name,
    },
    numGuests: event._count.guests + 1,
  };
};

const removeEventGuest = async (eventId, userId, requestUser) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizers: {
        where: { userId: requestUser.id }
      }
    }
  });

  if (!event) throw { status: 404, message: 'Event not found' };

  // Check if requester is an organizer — they are not allowed to remove guests
  const isOrganizer = event.organizers.length > 0;
  const isManagerOrAbove = requestUser.role === 'manager' || requestUser.role === 'superuser';

  if (!isManagerOrAbove || isOrganizer) {
    throw { status: 403, message: 'Only managers or higher can remove guests (not organizers)' };
  }

  // Check if the guest exists
  const guest = await prisma.eventGuest.findFirst({
    where: {
      eventId: eventId,
      userId: userId
    }
  });

  if (!guest) {
    throw { status: 404, message: 'Guest not found in this event' };
  }

  await prisma.eventGuest.delete({
    where: { id: guest.id }
  });
};

const rsvpToEvent = async (eventId, user) => {
  const now = new Date();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      guests: true,
      _count: { select: { guests: true } }
    }
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  // Check if event is published and not ended
  if (!event.published || event.endTime <= now) {
    throw { status: 410, message: 'Event has ended or is not available' };
  }

  // Check if user is already a guest
  const alreadyGuest = event.guests.some(g => g.userId === user.id);
  if (alreadyGuest) {
    throw { status: 400, message: 'User is already on the guest list' };
  }

  // Check for capacity (if defined)
  if (event.capacity !== null && event._count.guests >= event.capacity) {
    throw { status: 410, message: 'Event is full' };
  }

  // Add user as guest
  const guest = await prisma.eventGuest.create({
    data: {
      event: { connect: { id: eventId } },
      user: { connect: { id: user.id } }
    }
  });

    // Fetch user's full data to get the name
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { utorid: true, name: true }
    });

  return {
    id: event.id,
    name: event.name,
    location: event.location,
    guestAdded: {
      id: guest.id,
      utorid: user.utorid,
      name: fullUser.name
    },
    numGuests: event._count.guests + 1
  };
};

const removeSelfFromEvent = async (eventId, userId) => {
  const now = new Date();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      guests: true
    }
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  if (event.endTime <= now) {
    throw { status: 410, message: 'Event has already ended' };
  }

  const guest = event.guests.find(g => g.userId === userId);

  if (!guest) {
    throw { status: 404, message: 'User did not RSVP to this event' };
  }

  await prisma.eventGuest.delete({
    where: { id: guest.id }
  });
};


const deleteEvent = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });



  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  if (event.published) {
    throw { status: 400, message: 'Cannot delete a published event' };
  }

  await prisma.$transaction([
    prisma.eventGuest.deleteMany({ where: { eventId } }),
    prisma.eventOrganizer.deleteMany({ where: { eventId } }),
    prisma.transaction.deleteMany({ where: { eventId } }),
    prisma.event.delete({ where: { id: eventId } })
  ]);
  
};

const createEventRewardTransaction = async (eventId, payload,user) => {
  const { utorid, amount, type, remark = ""} = payload;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw { status: 400, message: 'Invalid amount provided' };
  }
  if (type !== 'event') {
    throw { status: 400, message: 'Invalid transaction type. Must be "event"' };
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: { include: { user: true } } }
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  const isManager = user.role === 'manager' || user.role === 'superuser';
  const isOrganizer = await prisma.eventOrganizer.findFirst({
    where: { eventId, userId: user.id },
  });

  if (!isManager && !isOrganizer) {
    throw { status: 403, message: 'Not authorized to award event points' };
  }

  if (utorid) {
    const guest = event.guests.find(g => g.user.utorid === utorid);
    if (!guest) {
      throw { status: 400, message: 'User is not a guest of this event' };
    }

    if (event.pointsRemain < amount) {
      throw { status: 400, message: 'Insufficient points remaining in event' };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { pointsRemain: event.pointsRemain - amount, pointsAwarded: event.pointsAwarded + amount }
    });

    await prisma.user.update({
      where: { id: guest.userId },
      data: { points: guest.user.points + amount }
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: guest.userId,
        utorid: guest.user.utorid,
        type: 'event',
        earned: amount,
        amount,
        createdBy: user.utorid,
        remark,
        relatedId: eventId,
        eventId
      }
    });

    return {
      id: transaction.id,
      recipient: guest.user.utorid,
      awarded: amount,
      type: 'event',
      relatedId: eventId,
      remark,
      createdBy: user.utorid
    };
  } else {
    if (event.pointsRemain < event.guests.length * amount) {
      throw { status: 400, message: 'Not enough points to award all guests' };
    }

    const created = [];

    for (const guest of event.guests) {
      await prisma.user.update({
        where: { id: guest.userId },
        data: { points: guest.user.points + amount }
      });

      const transaction = await prisma.transaction.create({
        data: {
          userId: guest.userId,
          utorid: guest.user.utorid,
          type: 'event',
          earned: amount,
          amount,
          createdBy: user.utorid,
          remark,
          relatedId: eventId,
          eventId
        }
      });

      created.push({
        id: transaction.id,
        recipient: guest.user.utorid,
        awarded: amount,
        type: 'event',
        relatedId: eventId,
        remark,
        createdBy: user.utorid
      });
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        pointsRemain: event.pointsRemain - amount * event.guests.length,
        pointsAwarded: event.pointsAwarded + amount * event.guests.length
      }
    });

    return created;
  }
};

module.exports = { createEvent, 
  getEvents, 
  getEventById, 
  addEventOrganizer, 
  updateEvent, 
  removeEventOrganizer, 
  addEventGuest,
  removeEventGuest,
  rsvpToEvent,
  removeSelfFromEvent,
  deleteEvent,
  createEventRewardTransaction
  };
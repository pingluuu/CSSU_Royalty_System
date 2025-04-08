/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

async function main() {
  // Clear data
  await prisma.transactionPromotion.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.eventGuest.deleteMany();
  await prisma.eventOrganizer.deleteMany();
  await prisma.event.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();

  // === USERS ===
  const roles = ['regular', 'cashier', 'manager', 'superuser'];
  const users = [];

  for (let i = 1; i <= 15; i++) {
    const role = i === 13 ? 'cashier' : i === 14 ? 'manager' : i === 15 ? 'superuser' : 'regular';
    users.push({
      utorid: `user${i}`,
      name: `User ${i}`,
      email: `user${i}@mail.utoronto.ca`,
      password: PASSWORD_HASH,
      role,
      verified: i % 2 === 0,
      suspicious: i % 5 === 0,
      points: i * 50
    });
  }

  await prisma.user.createMany({ data: users });
  const allUsers = await prisma.user.findMany();

  // === PROMOTIONS ===
  for (let i = 1; i <= 9; i++) {
    await prisma.promotion.create({
      data: {
        name: `Promo ${i}`,
        description: `Promo ${i} - amazing deal!`,
        type: i % 2 === 0 ? 'automatic' : 'one_time',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minSpending: 10 + i,
        rate: 0.01 * i,
        points: 5 * i
      }
    });
  }

  const allPromos = await prisma.promotion.findMany();

  // === EVENTS ===
  const events = [];
  for (let i = 1; i <= 9; i++) {
    const event = await prisma.event.create({
      data: {
        name: `Event ${i}`,
        description: `Event ${i} description`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        location: `Room ${i}01`,
        capacity: 100,
        points: 200,
        pointsRemain: 200,
        pointsAwarded: 0,
        published: true
      }
    });

    await prisma.eventOrganizer.create({
      data: {
        userId: allUsers.find(u => u.role === 'manager').id,
        eventId: event.id
      }
    });

    await prisma.eventGuest.create({
      data: {
        userId: allUsers[i % allUsers.length].id,
        eventId: event.id
      }
    });

    events.push(event);
  }

  // === TRANSACTIONS (45 total) ===
  const types = ['purchase', 'adjustment', 'redemption', 'transfer', 'event'];

  for (let i = 0; i < 45; i++) {
    const type = types[i % types.length];
    const user = allUsers[i % allUsers.length];
    const baseData = {
      utorid: user.utorid,
      userId: user.id,
      type,
      remark: `Auto-generated ${type} transaction`,
      createdBy: 'user14',
    };

    if (type === 'purchase') {
      baseData.spent = 25 + i;
      baseData.earned = (25 + i) * 4;
    }

    if (type === 'adjustment') {
      baseData.amount = i % 2 === 0 ? 20 : -20;
      baseData.relatedId = 1;
    }

    if (type === 'redemption') {
      baseData.amount = 100;
      baseData.processed = true;
    }

    if (type === 'transfer') {
      baseData.amount = 50;
      baseData.relatedId = allUsers[(i + 1) % allUsers.length].id;
    }

    if (type === 'event') {
      baseData.amount = 75;
      baseData.eventId = events[i % events.length].id;
      baseData.relatedId = events[i % events.length].id;
    }

    await prisma.transaction.create({ data: baseData });
  }

  console.log('✅ Done: Seeded 15 users, 45 transactions, 9 events, 9 promotions');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
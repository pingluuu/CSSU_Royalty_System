'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

async function main() {
  // Clear existing data
  await prisma.transactionPromotion.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.eventGuest.deleteMany();
  await prisma.eventOrganizer.deleteMany();
  await prisma.event.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();

  // === USERS ===
  const users = [
    ...Array.from({ length: 11 }, (_, i) => ({
      utorid: `user${i + 1}`,
      name: `user${i + 1}`,
      email: `user${i + 1}@mail.utoronto.ca`,
      password: PASSWORD_HASH,
      role: 'regular',
      verified: (i + 1) % 2 === 0,
      suspicious: (i + 1) % 5 === 0,
      points: (i + 1) * 50,
    })),
    {
      utorid: 'cashier1',
      name: 'cashier1',
      email: 'cashier1@mail.utoronto.ca',
      password: PASSWORD_HASH,
      role: 'cashier',
      verified: true,
      suspicious: false,
      points: 500,
    },
    {
      utorid: 'manager1',
      name: 'manager1',
      email: 'manager1@mail.utoronto.ca',
      password: PASSWORD_HASH,
      role: 'manager',
      verified: true,
      suspicious: false,
      points: 600,
    },
    {
      utorid: 'superuser1',
      name: 'superuser1',
      email: 'superuser1@mail.utoronto.ca',
      password: PASSWORD_HASH,
      role: 'superuser',
      verified: true,
      suspicious: false,
      points: 700,
    },
  ];

  await prisma.user.createMany({ data: users });
  const allUsers = await prisma.user.findMany();

  // === PROMOTIONS ===
  for (let i = 1; i <= 20; i++) {
    const now = new Date();
    const daysOffset = (i - 10) * 2;
    await prisma.promotion.create({
      data: {
        name: `Promo ${i}`,
        description: `Promo ${i} - special deal!`,
        type: i % 3 === 0 ? 'automatic' : 'one_time',
        startTime: new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + (daysOffset + 7) * 24 * 60 * 60 * 1000),
        minSpending: 5 + (i % 5) * 10,
        rate: i % 2 === 0 ? 0.01 * i : undefined,
        points: i % 2 !== 0 ? 10 * i : undefined,
      },
    });
  }

  const allPromos = await prisma.promotion.findMany();

  // === EVENTS ===
  const eventScenarios = [
    { label: 'ongoing', offset: -1, duration: 2 }, // started 1hr ago, ends in 1hr
    { label: 'past', offset: -5, duration: 2 },    // started 5hrs ago, ended 3hrs ago
    { label: 'future', offset: 5, duration: 2 },   // starts in 5hrs, ends in 7hrs
  ];

  const events = [];

  for (let i = 1; i <= 15; i++) {
    const scenario = eventScenarios[i % eventScenarios.length];
    const now = new Date();
    const startTime = new Date(now.getTime() + scenario.offset * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + scenario.duration * 60 * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        name: `Event ${i} (${scenario.label})`,
        description: `Event ${i} is a ${scenario.label} event.`,
        startTime,
        endTime,
        location: `Room ${i}01`,
        capacity: 100,
        points: 200,
        pointsRemain: 200,
        pointsAwarded: 0,
        published: true,
      },
    });

    await prisma.eventOrganizer.create({
      data: {
        userId: allUsers.find((u) => u.role === 'manager').id,
        eventId: event.id,
      },
    });

    await prisma.eventGuest.create({
      data: {
        userId: allUsers[i % allUsers.length].id,
        eventId: event.id,
      },
    });

    events.push(event);
  }
  // === FAR FUTURE EVENTS ===
  const futureOffsetsInDays = [30, 60, 90];

  for (let i = 0; i < futureOffsetsInDays.length; i++) {
    const days = futureOffsetsInDays[i];
    const now = new Date();
    const startTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour event

    const label = String.fromCharCode(65 + i); // A, B, C
    const event = await prisma.event.create({
      data: {
        name: `Event ${label} (future)`,
        description: `This event starts in ${days} days.`,
        startTime,
        endTime,
        location: `Room ${label}F`,
        capacity: 100,
        points: 200,
        pointsRemain: 200,
        pointsAwarded: 0,
        published: true,
      },
    });

    await prisma.eventOrganizer.create({
      data: {
        userId: allUsers.find((u) => u.role === 'manager').id,
        eventId: event.id,
      },
    });

    await prisma.eventGuest.create({
      data: {
        userId: allUsers[i % allUsers.length].id,
        eventId: event.id,
      },
    });
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
      createdBy: 'manager1',
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

  console.log('✅ Done: Seeded 14 users, 20 promotions, 15 events, 45 transactions');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
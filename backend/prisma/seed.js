/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
// Import PrismaClient
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

async function seed() {
  // update regular1 utorid user points to be 1020
  const regularUser = await prisma.user.findUnique({
    where: { utorid: 'regular1' },
  });
  if (regularUser) {
    await prisma.user.update({
      where: { utorid: 'regular1' },
      data: { points: 1020 },
    });
    console.log('Updated regular1 user points to 1020');
  } else {
    console.log('User with utorid regular1 not found');
  }
}

// Run the seed function and handle errors
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma Client after seeding
    await prisma.$disconnect();
  });
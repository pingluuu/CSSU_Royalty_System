/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
// Import PrismaClient
const { PrismaClient } = require('@prisma/client');

// prisma/seed.ts
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.createMany({
    data: [
      {
        utorid: 'manager1',
        name: 'Manager 1',
        email: 'manager1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'MANAGER',
        verified: true,
        points: 700
      },
      {
        utorid: 'regular1',
        name: 'Regular 1',
        email: 'regular1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'USER',
        verified: true,
      },
      {
        utorid: 'cashier1',
        name: 'Cashier 1',
        email: 'cashier1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'CASHIER',
        verified: true,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('🌱 Seeding complete!');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

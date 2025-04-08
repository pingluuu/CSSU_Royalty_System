/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password1', 10);

  await prisma.user.createMany({
    data: [
      {
        utorid: 'manager1',
        name: 'Manager 1',
        email: 'manager1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'manager',
      },
      {
        utorid: 'regular1',
        name: 'Regular User 1',
        email: 'reguar1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'regular',
      },
      {
        utorid: 'cashier1',
        name: 'Cashier 1',
        email: 'cashier1@mail.utoronto.ca',
        password: hashedPassword,
        role: 'cashier',
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

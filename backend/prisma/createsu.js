'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

if (process.argv.length !== 5) {
  console.error('Usage: node prisma/createsu.js <utorid> <email> <password>');
  process.exit(1);
}

const utorid = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

async function main() {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      utorid,
      name: "Superuser",
      email,
      password: hashedPassword,
      role: 'SUPERUSER', 
      verified: true, 
      expiresAt: new Date('9999-12-31T23:59:59.999Z')   
    },
  });

  console.log('Superuser created successfully:', user);
}

main()
  .catch((error) => {
    console.error('Error creating superuser:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

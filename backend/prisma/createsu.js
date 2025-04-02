/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const createSuperuser = async (utorid, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const superUser = await prisma.user.create({
            data: {
                utorid,
                name: 'Superuser',
                email,
                password: hashedPassword,
                role: 'superuser',
                verified: true, // Superuser should be automatically verified
            },
        });
        console.log(`Superuser created: ${superUser.email}`);
    } catch (error) {
        console.error(`Failed to create superuser: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
};

const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log('Usage: node prisma/createsu.js <utorid> <email> <password>');
    process.exit(1);
}

const [utorid, email, password] = args;

createSuperuser(utorid, email, password);

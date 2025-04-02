const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const prisma = new PrismaClient();
const SECRET_KEY = 'secret_key'; // Hard-code for this assignment

const authenticateUser = async (utorid, password) => {


    // Find user by utorid
    const user = await prisma.user.findUnique({
        where: { utorid },
    });

    if (!user) {
        throw {
            status: 404,
            error: 'User not found'
        };
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { status: 401, error: 'Invalid UTORid or password' };
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, utorid: user.utorid, role: user.role },
        SECRET_KEY,
        { expiresIn: '1y' }
    );

    //  Use plain JavaScript Date object to calculate expiration time
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await prisma.user.update({
        where: { utorid },
        data: { lastLogin: new Date() }
    });

    return { token, expiresAt };
};

const resetRequests = {}; // In-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

const requestPasswordReset = async (utorid) => {
    // Rate-limiting check
    const now = Date.now();
    if (resetRequests[utorid] && now - resetRequests[utorid] < RATE_LIMIT_WINDOW) {
        throw {
            status: 429,
            error: 'Too Many Requests. Please try again later.'
        };
    }
    resetRequests[utorid] = now;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { utorid },
    });

    if (!user) {
        // Return 404 if the user is not found
        throw {
            status: 404,
            error: 'User not found'
        };
    }

    // Generate reset token (UUID) and expiration
    const resetToken = uuidv4(); // Generate a unique token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token and expiration to database
    await prisma.user.update({
        where: { utorid },
        data: {
            resetToken,
            expiresAt,
        },
    });

    return { 
        resetToken, 
        expiresAt: expiresAt.toISOString() 
    };
};

const validatePassword = (password) => {
    if (
        !password ||
        password.length < 8 ||
        password.length > 20 ||
        !/[A-Z]/.test(password) || // At least one uppercase letter
        !/[a-z]/.test(password) || // At least one lowercase letter
        !/[0-9]/.test(password) || // At least one number
        !/[^A-Za-z0-9]/.test(password) // At least one special character
    ) {
        throw {
            status: 400,
            error: 'Invalid password format'
        };
    }
};

const resetPassword = async (resetToken, utorid, password) => {
    // Check if token exists and is not expired
 
    const user = await prisma.user.findUnique({
        where: {
            resetToken
        }
    });

    if (!user) {
  
        throw {
            status: 404,
            error: 'Reset token not found'
        };
    }

    if (user.expiresAt < new Date()) {
        throw {
            status: 410,
            error: 'Reset token expired'
        };
    }

    // Verify UTORid matches the token owner
    if (user.utorid !== utorid) {
        throw {
            status: 401,
            error: 'UTORid does not match the token'
        };
    }

    // Validate password format
    validatePassword(password);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new password, clear reset token and expiration
    await prisma.user.update({
        where: { utorid: user.utorid },
        data: {
            password: hashedPassword,
            resetToken: null,
            expiresAt: null
        }
    });

    return { message: 'Password reset successful' };
};

module.exports = { authenticateUser, requestPasswordReset, resetPassword };

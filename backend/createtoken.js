const jwt = require('jsonwebtoken');

const JWT_SECRET = "12345"; // same secret as in your app

// Customize the payload as needed. For example, a token for a CASHIER role:
const payload1 = {
    role: "User",
};


const payload2 = {
    id: 3,
    role: "Cashier",
};

const payload3 = {
    role: "Manager",
};

const payload4 = {
    id: 1,
    role: "Superuser",
};
  
const token1 = jwt.sign(payload1, JWT_SECRET, { expiresIn: '8h' });
const token2 = jwt.sign(payload2, JWT_SECRET, { expiresIn: '8h' });
const token3 = jwt.sign(payload3, JWT_SECRET, { expiresIn: '8h' });
const token4 = jwt.sign(payload4, JWT_SECRET, { expiresIn: '8h' });

console.log("Generated User token:", token1);
console.log("Generated Cashier token:", token2);
console.log("Generated Manager token:", token3);
console.log("Generated Superuser token:", token4);
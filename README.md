# 🌟 CSC309 Loyalty System Web App

> Built by **Ping Lu, Ethan Hsu, Caesar Saleh**  
> For the **CSC309: Web Development Course Term Project**  
> University of Toronto – Winter 2025

---

## 📋 Description

This is a **loyalty point system web application** where users can:

- Register and participate in **events**
- Make **purchases** and receive **awards**
- View **promotions**, manage **transactions**, and more

The platform supports multiple roles with role-based access:

- 👤 **Regular User**: Browse and participate
- 🧾 **Cashier**: Create user accounts and record purchases
- 🧑‍💼 **Manager**: Create and manage events, award points
- 🛠️ **Superuser**: Full administrative privileges

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript  
- **Backend**: Express.js, Prisma ORM  
- **Database**: SQLite (via Prisma)

---

## 🛆 Libraries & Frameworks Used

| Category       | Libraries                                                                 |
|----------------|---------------------------------------------------------------------------|
| Auth/Security  | `bcrypt`, `jsonwebtoken`, `express-jwt`                                   |
| QR Scanning    | `html5-qrcode`, `qrcode.react`                                            |
| File Uploads   | `multer`                                                                  |
| Miscellaneous  | `uuid`, `cors`                                                            |
| AI Assistant(Code Attribution)   | `ChatGPT` by OpenAI for code assistance and refinement                    |

---

## 🚀 Getting Started

The repository includes both **frontend** and **backend** codebases.

### 📁 Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the React frontend using **Vite**.

---

### 🗓️ Initialize the Database

```bash
npx prisma db push
```

This pushes your current Prisma schema to SQLite and creates tables.

---

### 🌱 Seed the Database (Optional but Recommended)

```bash
npx prisma db seed
```

This seeds the database with a **variety of realistic users, events, and transactions**.  
Great for testing full functionality out-of-the-box!

---

### 👑 Create a Superuser

```bash
cd backend/prisma
node createsu.js
```

This creates a new superuser account so you can access admin features.

---

### 🔙 Start the Backend

```bash
cd backend
npm install
node --watch 3000 index.js
```

Make sure the port (`3000`) matches your `.env` and frontend config (`VITE_API_BASE_URL`).

---

## ✅ That’s It — You’re Ready!

> Enjoy exploring our loyalty system app.  
> We hope it’s intuitive, fun to use, and robust for all user types.

---

## 🙏 Acknowledgements

Huge thanks to **Professor Jack Sun** and the amazing **CSC309 Course Staff**  
for crafting an engaging and challenging course. We learned a ton!

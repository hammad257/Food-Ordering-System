# Food Ordering System API

A **NestJS backend API** for a food ordering system with email OTP login, JWT authentication, product management, cart, and orders.

---

## **Features**

1. **User Management**
   - Register and manage users.
   - Login using **email OTP** or **JWT authentication**.

2. **Authentication**
   - JWT-based **access and refresh tokens**.
   - OTP-based login using email **Mailtrap**.
   - Password hashing with **bcrypt**.
   - OTP stored **in-memory**

3. **Products**
   - Admin route can **add or delete products**.
   - Users Get all products
   
4. **Cart**
   - Users can **add, delete, or update items** in their cart.

5. **Orders**
   - Users can **place orders** based on their cart items.

6. **Email Integration**
   - OTP emails are sent using **Mailtrap** (sandbox/testing environment).

---

## **Tech Stack**

- **Backend:** NestJS  
- **Database:** PostgreSQL
- **ORM** Primsa  
- **Authentication:** JWT(access and refresh token) and used gaurds for validation, bcrypt, OTP (in-memory)  
- **Queues (Optional):** RabbitMQ

## **Scalability Features**

- **Node.js Clustering** App can run multiple worker processes to utilize all CPU cores
- **Database Optimization** PostgreSQL tables optimized with indexes on frequently queried fields
- **Message Queue (RabbitMQ)** Orders are published to RabbitMQ exchanges for asynchronous processing, allowing high concurrency and background tasks
- **Validation** request validation with Global Pipes
- **Rate Limiting** implement rate limiting with throttler

## **Prerequisites**

- Node.js ≥ v18  
- npm or yarn  
- PostgreSQL installed and running  
- Mailtrap account for testing OTP emails
- Docker (using RabbitMQ locally)

---

## **Installation & Setup**

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <project-folder>

 ##  **Setup**
   npm install
   Create a .env file in the root directory
   Make Prisma on root - npx prisma init
   Generate Prisma client - npx prisma generate
   Run database migrations - npx prisma migrate dev --name init
   Start the server - npm run start:dev
   Run the docker
   use this url http://localhost:15672(guest / guest) for rabbitMQ
   Replace placeholders with your own credentials before running

## **License & Author**

   Author: Hamad Azam
   License: MIT
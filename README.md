📦 Product Pricing Aggregation Service

A NestJS-based microservice that fetches product pricing from multiple vendors, selects the best available offer, caches data for performance, and periodically refreshes prices.

🧩 Features
🔹 Multi-vendor price aggregation

Fetches real-time or mocked vendor responses (VendorA, VendorB, VendorC).

🔹 Best-price computation

Selects vendor with the lowest valid price.

🔹 Caching Layer (Redis + In-Memory Fallback)

Primary: Redis

Fallback: Internal memory store

Auto-expiration TTL

Robust fallback if Redis is offline

🔹 Fault-tolerant vendor calls

If a vendor API fails, service continues without breaking.

🔹 Cron-based full price refresh

Automatically refreshes all products every X minutes.

🔹 Manual refresh endpoint

You can refresh specific product using:

POST /products/refresh/:sku

🔹 Clean modular folder layout
src/
 ├── product/
 ├── vendor/
 ├── cache/
 ├── scheduler/
 ├── common/

🚀 Tech Stack

Node.js + NestJS

MongoDB (Mongoose)

Redis (optional)

ioredis

TypeScript

 Setup Instructions
1️⃣ Install dependencies
npm install

2️⃣ Set up environment variables

Create .env:

MONGO_URI=mongodb://localhost:27017/pricing-db
REDIS_HOST=localhost
REDIS_PORT=6379

3️⃣ Start the application

Dev mode:

npm run start:dev


Prod build:

npm run build
npm run start:prod

🔗 Available Endpoints
📌 Get product (from DB → or cache → or vendor refresh)
GET /products/:sku

📌 Manually refresh a product
POST /products/refresh/:sku

Example Response:
{
  "message": "Product IPH15-BLK-128 refreshed",
  "result": {
    "bestPrice": 398.81,
    "bestVendor": "VendorA",
    "vendorResponses": [ ... ]
  }
}

⏱ Cron Job
Every 30 minutes:
- Fetch all products
- Refresh each vendor pricing
- Update DB + cache

🗄 Caching Logic
Get Flow:

Try Redis

If Redis fails → fallback memory

Check TTL expiration

Return cached object

Set Flow:

Save in Redis with TTL

If fails → save in memory fallback

Delete Flow:

Delete from Redis

If fails → delete from memory
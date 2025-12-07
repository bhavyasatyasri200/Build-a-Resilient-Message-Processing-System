🚀 Galactic Message Relay System

A simple distributed message relay system built using Node.js, Express, and Redis, designed to demonstrate:

✔ Exactly-once message processing
✔ Idempotency (duplicate detection)
✔ Retry mechanism on processing failure

This system has two services:

Producer API → receives messages & pushes them into a Redis queue

Consumer Worker → pulls messages and processes them exactly once

📁 Project Structure
galactic-relay/
│
├── producer/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
│
├── consumer/
│   ├── worker.js
│   ├── package.json
│   └── node_modules/
│
└── README.md

🛠️ Setup Instructions (Evaluator Must Follow These Steps)
1️⃣ Install Redis

Ensure Redis is installed and running.

Start Redis:
redis-server

Check if Redis is running:
redis-cli ping


Expected output:

PONG

📦 2️⃣ Install Dependencies
Producer Service
cd producer
npm install

Consumer Service
cd consumer
npm install


This will recreate node_modules if deleted.

▶️ 3️⃣ Run the System
Start Producer API
cd producer
node server.js


Producer runs at:

http://localhost:3000

Start Consumer Worker
cd consumer
node worker.js


Consumer will listen for messages from Redis.

📤 4️⃣ Test the System
✔ Send message to Producer API

Using PowerShell:

Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"


Producer output:

Message queued successfully


Consumer output:

Processing message: test001

✔ Test Duplicate Handling (Idempotency)

Run same command again:

Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"


Consumer output:

Skipping duplicate: test001

✔ Test Message Queue in Redis

Check queue length:

redis-cli llen messageQueue


Check processed messages:

redis-cli smembers processedMessages

🔁 5️⃣ Retry Mechanism Example

Inside worker.js, processing is wrapped with:

try {
   // processing logic
} catch (err) {
   await redis.rpush("messageQueue", message);
}


Meaning:

If processing fails → message is returned to queue

Consumer retries

No message is lost

🎯 6️⃣ Key Conditions Implemented
1. Exactly-Once Processing

A Redis SET called processedMessages stores all processed messages.

Before processing, the worker checks:

if (await redis.sismember("processedMessages", message)) {
    console.log("Skipping duplicate:", message);
    continue;
}


This ensures each message is processed only once.

2. Idempotency

Messages with the same ID (msg value) are not processed twice.

Duplicate messages are skipped instantly.

Verified using:

Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"

3. Retry on Failure

If processing throws an error:

Message is pushed back to Redis

Worker attempts again

Allows recovery from temporary failures

🧪 7️⃣ All Commands Used (Full List)
Git Commands
git init
git add .
git commit -m "Initial commit"
git remote add origin <repo-url>
git branch -M main
git push -u origin main

Redis Commands
redis-server
redis-cli ping
redis-cli llen messageQueue
redis-cli smembers processedMessages

Producer Commands
cd producer
npm install
node server.js

Consumer Commands
cd consumer
npm install
node worker.js

PowerShell API Testing
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test002"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"  # duplicate test

🧠 How Everything Works (Short Explanation)

Producer receives message → pushes to Redis list messageQueue

Consumer reads queue continuously

Before processing, consumer checks Redis SET:

If processed already → skip

Else → process

After success → message is added to processedMessages

If error happens → message returned to queue (retry)

This guarantees:

No message loss

No message duplication

Fault tolerance

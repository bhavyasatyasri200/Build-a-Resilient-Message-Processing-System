Galactic Message Relay

Galactic Message Relay is a Node.js + Express + Redis project demonstrating a producer-consumer message queue system with idempotency, retries, and poison queue handling.
This system contains two services:

Producer (API server) → Receives messages from clients and pushes them into Redis

Consumer (Worker) → Pulls messages from Redis and processes them exactly once

Project Structure
galactic-relay/
├── producer/
│   ├── app.js         # Express server: POST /command, GET /status
│   ├── queue.js       # Redis connection and queue helpers
│   └── package.json
├── consumer/
│   ├── worker.js      # Consumer with retry and poison queue
│   ├── queue.js       # Redis connection
│   └── package.json
└── README.md

Setup Commands
1️⃣ Install dependencies
cd producer
npm install
cd ../consumer
npm install

2️⃣ Start Redis server
net start redis

3️⃣ Verify Redis
redis-cli ping   # Should respond PONG
netstat -ano | findstr :6379  # Check if Redis port 6379 is listening

Run the Application

Start Producer

cd producer
node app.js


Start Consumer

cd consumer
node worker.js

Testing Commands

Send message to queue

PowerShell:

Invoke-WebRequest -Uri "http://localhost:3000/command" -Method POST -Body '{"message_id":"test001","payload":"hello galaxy"}' -ContentType "application/json"


cURL:

curl -X POST http://localhost:3000/command -H "Content-Type: application/json" -d '{"message_id":"test001","payload":"hello galaxy"}'


Check message status

Invoke-WebRequest -Uri "http://localhost:3000/status/test001" -Method GET


Response example:

{"message_id":"test001","status":"queued"}


Observe consumer logs

cd consumer
node worker.js


Logs include:

Consumer worker started...

Skipping duplicate: test001

Retrying (1) for test001

Successfully processed: test001

Moved to poison queue: test001

Key Conditions / Functionalities

Idempotency (Prevent Duplicate Processing)

Messages with the same message_id are skipped if already processed.

Redis SET called PROCESSED_SET tracks processed messages.

Example Log: Skipping duplicate: test001

Retry Mechanism (Temporary Failures)

Messages that fail processing are retried up to 2 times.

Example Log:

Error: Simulated processing failure
Retrying (1) for test001


Poison Queue (Permanent Failures)

Messages that fail more than 2 times are moved to a poison queue.

Allows later analysis and prevents infinite retries.

Example Log: Moved to poison queue: test001

Features

Node.js + Express producer server

Redis queue for message passing

Idempotency, retries, and poison queue handling

Easy to test via PowerShell or cURL

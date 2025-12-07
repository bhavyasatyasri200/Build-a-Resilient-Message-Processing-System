**🚀 Galactic Message Relay System**

A simple distributed message relay system built using **Node.js**, **Express**, and **Redis**, designed to demonstrate:

- ✔ Exactly-once message processing  
- ✔ Idempotency (duplicate detection)  
- ✔ Retry mechanism on processing failure  

This system includes two services:

- **Producer API** → Receives messages and pushes them into a Redis queue.  
- **Consumer Worker** → Pulls messages and processes them exactly once.  

***

### 📁 Project Structure

```
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
```

***

### 🛠️ Setup Instructions (Evaluator Must Follow These Steps)

#### 1️⃣ Install Redis

Ensure Redis is installed and running.

Start Redis:
```
redis-server
```

Check if Redis is running:
```
redis-cli ping
```

Expected output:
```
PONG
```

***

#### 📦 2️⃣ Install Dependencies

**Producer Service**
```
cd producer
npm install
```

**Consumer Service**
```
cd consumer
npm install
```

This recreates `node_modules` if deleted.

***

#### ▶️ 3️⃣ Run the System

**Start Producer API**
```
cd producer
node server.js
```

Producer runs at:  
`http://localhost:3000`

**Start Consumer Worker**
```
cd consumer
node worker.js
```

The consumer listens for messages from Redis.

***

#### 📤 4️⃣ Test the System

**✔ Send a message to the Producer API**

Using PowerShell:
```
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
```

Producer output:
```
Message queued successfully
```

Consumer output:
```
Processing message: test001
```

***

**✔ Test Duplicate Handling (Idempotency)**

Run the same command again:
```
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
```

Consumer output:
```
Skipping duplicate: test001
```

***

**✔ Check Message Queue in Redis**

Check the queue length:
```
redis-cli llen messageQueue
```

Check processed messages:
```
redis-cli smembers processedMessages
```

***

#### 🔁 5️⃣ Retry Mechanism Example

Inside `worker.js`, the processing logic is wrapped in a `try-catch` block:

```js
try {
   // processing logic
} catch (err) {
   await redis.rpush("messageQueue", message);
}
```

Meaning:

- If processing fails → the message is returned to the queue  
- The consumer retries processing  
- No message is lost  

***

### 🎯 6️⃣ Key Conditions Implemented

**1. Exactly-Once Processing**

A Redis **SET** named `processedMessages` stores all processed messages.

Before processing, the worker checks:

```js
if (await redis.sismember("processedMessages", message)) {
    console.log("Skipping duplicate:", message);
    continue;
}
```

This ensures each message is processed only once.

***

**2. Idempotency**

Messages with the same ID (`msg` value) are not processed multiple times.  
Duplicate messages are skipped instantly.

Verified using:
```
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
```

***

**3. Retry on Failure**

If processing throws an error:

- The message is pushed back to Redis  
- The worker retries the operation  

This enables recovery from temporary failures.

***

### 🧪 7️⃣ All Commands Used (Full List)

**Git Commands**
```
git init
git add .
git commit -m "Initial commit"
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```

**Redis Commands**
```
redis-server
redis-cli ping
redis-cli llen messageQueue
redis-cli smembers processedMessages
```

**Producer Commands**
```
cd producer
npm install
node server.js
```

**Consumer Commands**
```
cd consumer
npm install
node worker.js
```

**PowerShell API Testing**
```
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test002"
Invoke-WebRequest -Uri "http://localhost:3000/produce?msg=test001"  # duplicate test
```

***

### 🧠 How It Works (Short Explanation)

1. The **Producer** receives messages and pushes them to the Redis list `messageQueue`.  
2. The **Consumer** continuously reads from the queue.  
3. Before processing, the consumer checks the Redis set `processedMessages`:  
   - If already processed → skip.  
   - Otherwise → process the message.  
4. After successful processing, the message is added to `processedMessages`.  
5. If an error occurs, the message is re-queued to ensure it’s retried.

This design guarantees:
- No message loss  
- No message duplication  
- Fault tolerance  

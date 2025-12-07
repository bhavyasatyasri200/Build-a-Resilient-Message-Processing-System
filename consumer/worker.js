// consumer/worker.js
const { redis, MAIN_QUEUE, POISON_QUEUE, PROCESSED_SET } = require("./queue");

console.log("Consumer worker started...");

async function processMessage(msg) {
  const { message_id, payload } = msg;

  console.log(`Processing message ${message_id}`);

  // 30% chance of simulated failure
  if (Math.random() < 0.3) {
    throw new Error("Simulated processing failure");
  }
  // inside processMessage function
if (payload.includes("fail")) {
    throw new Error("Simulated failure");
}


  console.log(`Successfully processed: ${message_id}`);
}

async function runWorker() {
  while (true) {
    // Pop message from main queue
    const raw = await redis.lPop(MAIN_QUEUE);

    if (!raw) {
      // Wait 1 second if queue is empty
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    let msg = JSON.parse(raw);
    const { message_id, retry } = msg;

    // Idempotency check
    const processed = await redis.sIsMember(PROCESSED_SET, message_id);

    if (processed) {
      console.log(`Skipping duplicate: ${message_id}`);
      continue;
    }

    try {
      // Process the message
      await processMessage(msg);

      // Mark as processed
      await redis.sAdd(PROCESSED_SET, message_id);

      // Update status for /status/:id endpoint
      await redis.hSet(`message:${message_id}`, "status", "processed");

      console.log(`Message completed: ${message_id}`);
    } catch (err) {
      console.log(`Error processing ${message_id}: ${err.message}`);

      if (retry < 2) {
        // Retry message
        msg.retry += 1;
        console.log(`Retrying (${msg.retry}) for ${message_id}`);
        await redis.rPush(MAIN_QUEUE, JSON.stringify(msg));
      } else {
        // Move to poison queue
        console.log(`Moved to poison queue: ${message_id}`);
        await redis.rPush(POISON_QUEUE, JSON.stringify(msg));

        // Update status for /status/:id endpoint
        await redis.hSet(`message:${message_id}`, "status", "poison");
      }
    }
  }
}

// Start the worker
runWorker();

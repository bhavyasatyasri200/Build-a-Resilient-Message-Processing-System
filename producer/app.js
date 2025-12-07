// producer/app.js
const express = require("express");
const { redis, MAIN_QUEUE, POISON_QUEUE } = require("./queue");

const app = express();
app.use(express.json());

// POST /command
app.post("/command", async (req, res) => {
  const { message_id, payload } = req.body;

  if (!message_id) {
    return res.status(400).json({ error: "message_id is required" });
  }

  const message = { message_id, payload, retry: 0 };

  // Push to main queue
  await redis.rPush(MAIN_QUEUE, JSON.stringify(message));

  // Initialize status in Redis
  await redis.hSet(`message:${message_id}`, "status", "queued");

  return res.status(202).json({
    status: "queued",
    message_id,
  });
});

// GET /status
app.get("/status", async (req, res) => {
  const mainCount = await redis.lLen(MAIN_QUEUE);
  const poisonCount = await redis.lLen(POISON_QUEUE);

  res.json({
    primary_queue_length: mainCount,
    poison_queue_length: poisonCount,
  });
});

app.get("/status/:id", async (req, res) => {
  const id = req.params.id;

  const status = await redis.hGet(`message:${id}`, "status");

  if (!status) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.json({ message_id: id, status });
});

app.listen(3000, () => console.log("Producer running on port 3000"));

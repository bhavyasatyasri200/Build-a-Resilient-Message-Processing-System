// consumer/queue.js
const { createClient } = require("redis");

const redis = createClient();

redis.on("error", (err) => console.error("Redis Error:", err));

redis.connect();

const MAIN_QUEUE = "main_queue";
const POISON_QUEUE = "poison_queue";
const PROCESSED_SET = "processed_messages";

module.exports = {
  redis,
  MAIN_QUEUE,
  POISON_QUEUE,
  PROCESSED_SET,
};

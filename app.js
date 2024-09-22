const express = require("express");
const redis = require("redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const winston = require("winston");
const taskQueue = require("./taskQueue");

const app = express();
app.use(express.json());
app.use(express.static("public"));
// Set up Redis client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
  enable_offline_queue: false,
});

// Set up rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 20, // 20 tasks
  duration: 60, // per minute
  keyPrefix: "rl",
});

// Set up logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "task_logs.log" })],
});

// Task function
async function task(user_id) {
  const message = `${user_id}-task completed at-${Date.now()}`;
  console.log(message);
  logger.info(message);
}

app.post("/api/v1/task", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    await rateLimiter.consume(user_id);
    // If rate limit is not exceeded, add task to queue
    taskQueue.add({ user_id, task });
    res.json({ message: "Task queued successfully" });
  } catch (rejRes) {
    // If rate limit is exceeded, add task to queue with delay
    const delay = Math.floor(rejRes.msBeforeNext / 1000) || 1;
    taskQueue.add({ user_id, task }, { delay: delay * 1000 });
    res.json({ message: `Task queued with delay of ${delay} seconds` });
  }
});

const fs = require("fs");

app.get("/api/logs", (req, res) => {
  fs.readFile("task_logs.log", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading log file" });
      return;
    }
    const logs = data.split("\n").filter(Boolean);
    res.json(logs);
  });
});

module.exports = app;

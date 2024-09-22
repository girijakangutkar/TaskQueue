# Node.js Task Queue with Rate Limiting

This project implements a Node.js API cluster with two replica sets, featuring a task queueing system with rate limiting.

## Prerequisites

- Node.js (v14 or later recommended)
- Redis server

## Setup and Running

1. Install Redis on your system if you haven't already. Installation instructions can be found at https://redis.io/topics/quickstart

2. Start the Redis server:
   ```
   redis-server
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

The API will be available at `http://localhost:3000`.

## API Usage

Send a POST request to `/api/v1/task` with a JSON body containing a `user_id`:

```
POST /api/v1/task
Content-Type: application/json

{
  "user_id": "123"
}
```

## Rate Limiting

The API implements rate limiting of 1 task per second and 20 tasks per minute for each user ID. Requests exceeding the rate limit are queued and processed accordingly.

## Logging

Task completion logs are stored in `task_logs.log`.

## Notes

- The solution uses Redis for both rate limiting and task queueing.
- The application is set up to run two worker processes (replica sets) using Node.js cluster module.
- Rate limiting is implemented using the `rate-limiter-flexible` package.
- Task queueing is implemented using the `bull` package, which provides a robust queue system built on top of Redis.

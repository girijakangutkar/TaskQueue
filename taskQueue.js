const Queue = require("bull");

const taskQueue = new Queue("taskQueue", {
  redis: {
    host: "localhost",
    port: 6379,
  },
});

taskQueue.process(async (job) => {
  try {
    console.log(`Processing job: ${JSON.stringify(job.data)}`);
    const { user_id, task } = job.data;
    await task(user_id);
    console.log(`Completed job for user_id: ${user_id}`);
  } catch (err) {
    console.log(err);
  }
});

module.exports = taskQueue;

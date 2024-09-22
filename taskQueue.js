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
    const taskFunction = eval(`(${task})`);
    const result = await taskFunction(user_id);
    console.log(`Completed job for user_id: ${user_id}, result: ${result}`);
    return result;
  } catch (err) {
    console.error(`Error processing job: ${err}`);
    throw err;
  }
});

module.exports = taskQueue;

const Queue = require("bull");
const winston = require("winston");

const taskQueue = new Queue("taskQueue", {
  redis: {
    host: "localhost",
    port: 6379,
  },
});

taskQueue.process(async (job) => {
  try {
    console.log(`Processing job: ${JSON.stringify(job.data)}`);
    const { user_id, taskFunction, loggerOptions } = job.data;

    // Recreate the logger
    const logger = winston.createLogger({
      level: loggerOptions.level,
      format: winston.format[loggerOptions.format](),
      transports: [
        new winston.transports.File({ filename: loggerOptions.filename }),
      ],
    });

    // Create the task function
    const createTaskFn = eval(`(${taskFunction})`);
    const task = createTaskFn(logger);

    const result = await task(user_id);
    console.log(`Completed job for user_id: ${user_id}, result: ${result}`);
    return result;
  } catch (err) {
    console.error(`Error processing job: ${err}`);
    throw err;
  }
});

module.exports = taskQueue;

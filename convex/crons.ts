import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Retry failed image generations every 5 minutes
crons.interval(
    "retry-failed-images",
    { minutes: 5 },
    internal.ai.retryFailedImages
);

export default crons;

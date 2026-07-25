const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn(
      "REDIS_URL is not configured. Authentication rate limiting will use memory.",
    );
    return null;
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 3000,
      reconnectStrategy(retries) {
        if (retries > 3) return new Error("Redis reconnect limit reached");
        return Math.min(retries * 250, 1000);
      },
    },
  });

  client.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  try {
    await client.connect();
    redisClient = client;
    console.log("Redis connected");
    return redisClient;
  } catch (error) {
    if (client.isOpen) await client.disconnect();

    if (process.env.REDIS_REQUIRED === "true") {
      throw new Error(`Redis connection failed: ${error.message}`);
    }

    console.warn("Redis unavailable. Falling back to in-memory rate limiting.");
    return null;
  }
};

const closeRedis = async () => {
  if (redisClient?.isOpen) await redisClient.quit();
};

module.exports = { connectRedis, closeRedis };

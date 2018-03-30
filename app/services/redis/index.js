const redis = require('redis');
const redisClient = redis.createClient(6379, 'board-db');

export default redisClient

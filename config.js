require('dotenv').config();

const SECRETS = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_ID: process.env.BOT_ID,
  CHANNEL_1: process.env.CHANNEL_1,
  CHANNEL_2: process.env.CHANNEL_2,
  CHANNEL_3: process.env.CHANNEL_3,
  CHANNEL_4: process.env.CHANNEL_4,
  IFTTT_ENDPOINT: process.env.IFTTT_ENDPOINT
};

const STARS_THRESHOLD = 3;

module.exports = { SECRETS, STARS_THRESHOLD };

require('dotenv').config();

const SECRETS = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_ID: process.env.BOT_ID,
  CHANNEL_1: process.env.CHANNEL_1,
  CHANNEL_2: process.env.CHANNEL_2,
  CHANNEL_3: process.env.CHANNEL_3,
  CHANNEL_4: process.env.CHANNEL_4
};

const STARS_THRESHOLD = 3;

module.exports = { SECRETS, STARS_THRESHOLD };

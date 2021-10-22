require('dotenv').config();

const SECRETS = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_ID: process.env.BOT_ID,
  COLLECTION_CHANNEL: process.env.COLLECTION_CHANNEL,
  FUSION_CHANNEL: process.env.FUSION_CHANNEL,
  DISTRIBUTION_CHANNEL: process.env.DISTRIBUTION_CHANNEL,
  IFTTT_ENDPOINT: process.env.IFTTT_ENDPOINT,
  STARS_THRESHOLD: process.env.STARS_THRESHOLD
};

module.exports = { SECRETS };

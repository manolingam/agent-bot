const { MessageEmbed } = require('discord.js');
const axios = require('axios').default;

const { SECRETS, STARS_THRESHOLD } = require('../config');

const CHANNEL_1 = SECRETS.CHANNEL_1;
const CHANNEL_2 = SECRETS.CHANNEL_2;
const CHANNEL_3 = SECRETS.CHANNEL_3;
const CHANNEL_4 = SECRETS.CHANNEL_4;
const IFTTT_ENDPOINT = SECRETS.IFTTT_ENDPOINT;

const sendWarnMessage = (_client, _message, _content) => {
  _client.channels.cache
    .get(_message.channelId)
    .send({ content: _content })
    .then((message) => {
      setTimeout(() => {
        message.delete();
      }, 3000);
    });
};

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.on('messageReactionAdd', async (reaction, user) => {
      try {
        let message = await reaction.message.fetch();
        await reaction.fetch();

        // preflight checks
        if (
          message.channel.id === CHANNEL_1 ||
          message.channel.id === CHANNEL_2 ||
          message.channel.id === CHANNEL_3
        ) {
          if (reaction.emoji.name !== '⭐') {
            reaction.users.remove(user.id);
            sendWarnMessage(
              client,
              message,
              `Cannot use an emoji other than ⭐ <@${user.id}>`
            );
            return;
          }
          // if (user.id === message.author.id) {
          //   reaction.users.remove(user.id);
          //   sendWarnMessage(
          //     client,
          //     message,
          //     `Cannot ⭐ yourself <@${user.id}>`
          //   );
          //   return;
          // }
        }

        // get reacted user ids
        let result = await reaction.users.fetch();
        let reacted_users = '';
        result.map((user) => {
          reacted_users = reacted_users + `<@${user.id}> `;
        });

        if (reaction.count === STARS_THRESHOLD) {
          // the-wire channel ---------------------------------------------------
          if (message.channel.id === CHANNEL_1) {
            let msg = new MessageEmbed()
              .setColor('#fcba03')
              .setAuthor(message.author.username, message.author.avatarURL())
              .addFields(
                { name: '3 star content', value: message.content },
                { name: 'Starred by', value: reacted_users },
                { name: 'Jump to author message', value: message.url }
              );

            client.channels.cache.get(CHANNEL_2).send({
              content: `<@${message.author.id}>, your message is promoted! Anyone can now reply to this message & start composing possible tweets.`,
              embeds: [msg]
            });
          }

          // collection channel --------------------------------------------------
          if (
            message.channel.id === CHANNEL_2 &&
            message.type === 'REPLY' &&
            message.mentions.repliedUser.id === SECRETS.BOT_ID
          ) {
            let msg = new MessageEmbed()
              .setColor('#fcba03')
              .setAuthor(message.author.username, message.author.avatarURL())
              .addFields(
                { name: 'Proposed tweet', value: message.content },
                { name: 'Starred by', value: reacted_users },
                { name: 'Jump to author message', value: message.url }
              );

            client.channels.cache.get(CHANNEL_3).send({ embeds: [msg] });
            // let replied_message = await message.channel.messages.fetch(
            //   message.reference.messageId
            // );
            // replied_message.delete();
          } else if (
            message.channel.id === CHANNEL_2 &&
            message.type === 'REPLY' &&
            message.mentions.repliedUser.id !== SECRETS.BOT_ID
          ) {
            reaction.users.remove(user.id);
            sendWarnMessage(
              client,
              message,
              `You can only emojify a reply that's given to the agent bot <@${user.id}>`
            );
            return;
          } else if (
            message.channel.id === CHANNEL_2 &&
            message.type !== 'REPLY'
          ) {
            reaction.users.remove(user.id);
            sendWarnMessage(
              client,
              message,
              `You can only emojify a reply that's given to the agent bot <@${user.id}>`
            );
            return;
          }

          // fusion channel -------------------------------------------------------
          if (message.channel.id === CHANNEL_3) {
            try {
              await axios.post(IFTTT_ENDPOINT, {
                value1: message.embeds[0].fields[0].value
              });

              let msg = new MessageEmbed()
                .setColor('#fcba03')
                .setAuthor(message.author.username, message.author.avatarURL())
                .addFields(
                  {
                    name: 'Tweeted!',
                    value: message.embeds[0].fields[0].value
                  },
                  { name: 'Jump to message', value: message.url }
                );

              client.channels.cache.get(CHANNEL_4).send({ embeds: [msg] });
            } catch (err) {
              console.log(err);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    });

    // client.on('messageCreate', async (message) => {
    //   if (
    //     message.channel.id === CHANNEL_2 &&
    //     message.type === 'REPLY' &&
    //     message.mentions.repliedUser.id === '893721957579767809'
    //   ) {
    //     let replied_message = await message.channel.messages.fetch(
    //       message.reference.messageId
    //     );
    //     console.log(replied_message.embeds[0].fields[0]);
    //   }
    // });
  }
};

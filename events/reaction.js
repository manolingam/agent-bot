const { MessageEmbed } = require('discord.js');
const axios = require('axios').default;

const { SECRETS } = require('../config');

const COLLECTION_CHANNEL = SECRETS.COLLECTION_CHANNEL;
const FUSION_CHANNEL = SECRETS.FUSION_CHANNEL;
const DISTRIBUTION_CHANNEL = SECRETS.DISTRIBUTION_CHANNEL;
const IFTTT_ENDPOINT = SECRETS.IFTTT_ENDPOINT;
const STARS_THRESHOLD = SECRETS.STARS_THRESHOLD;

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
          message.channel.id === COLLECTION_CHANNEL ||
          message.channel.id === FUSION_CHANNEL
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

        if (reaction.count === parseInt(STARS_THRESHOLD)) {
          // collection channel ---------------------------------------------------
          if (message.channel.id === COLLECTION_CHANNEL) {
            let msg = new MessageEmbed()
              .setColor('#fcba03')
              .setAuthor(message.author.username, message.author.avatarURL())
              .addFields(
                { name: '3 star content', value: message.content },
                { name: 'Starred by', value: reacted_users },
                { name: 'Jump to author message', value: message.url }
              )
              .setFooter('You cannot unreact once reacted. So react wisely! ');

            client.channels.cache.get(FUSION_CHANNEL).send({
              content: `<@${message.author.id}>, your message is promoted! Anyone can now reply to this message & start composing possible tweets.`,
              embeds: [msg]
            });
          }

          // Fusion channel --------------------------------------------------
          if (
            message.channel.id === FUSION_CHANNEL &&
            message.type === 'REPLY' &&
            message.mentions.repliedUser.id === SECRETS.BOT_ID
          ) {
            // let msg = new MessageEmbed()
            //   .setColor('#fcba03')
            //   .setAuthor(message.author.username, message.author.avatarURL())
            //   .addFields(
            //     {
            //       name: 'Tweeted Content',
            //       value: message.content
            //     },
            //     { name: 'Starred by', value: reacted_users }
            //   )
            //   .setFooter('Link to posted tweet is asynchronous. Wait');

            try {
              await axios.post(IFTTT_ENDPOINT, {
                value1: message.content + ' #DIA'
              });

              // client.channels.cache
              //   .get(DISTRIBUTION_CHANNEL)
              //   .send({ embeds: [msg] });

              let replied_message = await message.channel.messages.fetch(
                message.reference.messageId
              );
              replied_message.delete();
            } catch (err) {
              console.log(err);
            }
          } else if (
            message.channel.id === FUSION_CHANNEL &&
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
            message.channel.id === FUSION_CHANNEL &&
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

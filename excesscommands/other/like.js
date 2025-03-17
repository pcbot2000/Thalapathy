const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { likecollection, likeuserconfig } = require('../../mongodb'); 

const FREEFIRE_API_KEY = process.env.FREEFIRE_API_KEY;
const allowedChannels = ['1311789875972014090', '1349772318355751035'];
const allowedUsers = ['1197447304110673963', '1004206704994566164'];
const DEFAULT_LIMIT = 1;

module.exports = {
    name: 'like',
    description: 'Give a like to a Free Fire player using UID.',
    execute: async (message, args) => {

        if (!allowedChannels.includes(message.channel.id)) {
            return message.reply('❌ This command can only be used in specific channels.');
        }

        if (args.length < 2) {
            return message.reply('❌ Usage: `!like <country> <UID>`\nExample: `!like bd 2349899077`');
        }

        const [country, uid] = args;
        const userId = message.author.id;
        const apiUrl = `https://likes.api.freefireofficial.com/api/${country}/${uid}?key=${FREEFIRE_API_KEY}`;

        try {
            const userConfig = await likeuserconfig.findOne({ userId });
            let userLimit = userConfig?.limit ?? DEFAULT_LIMIT; 

            const userLikeData = await likecollection.findOne({ userId });
            let likesUsed = userLikeData?.likesUsed ?? 0;
            let lastUsed = userLikeData?.lastUsed ?? 0;

            const currentTime = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (!allowedUsers.includes(userId)) { 
                if (likesUsed >= userLimit && currentTime - lastUsed < oneDay) {
                    return message.reply(`Oops!😌 <@${userId}> You have reached your daily like request limit (${userLimit}). Please wait 24 hours from the last claim.😓`);
                }
            }
            

            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 1) {
                await likecollection.updateOne(
                    { userId },
                    { $set: { lastUsed: currentTime }, $inc: { likesUsed: 1 } },
                    { upsert: true }
                );

                const { PlayerNickname, PlayerLevel, LikesbeforeCommand, LikesafterCommand, LikesGivenByAPI, KeyRemainingRequests } = data.response;

                const embed = new EmbedBuilder()
                    .setTitle(`🎉Booyah! 🎊 ${PlayerNickname} You have successfully claimed ${LikesGivenByAPI} likes!🥳`)
                    .setDescription(
                        `👤 **Player:** ${PlayerNickname}\n` +
                        `🎮 **Level:** ${PlayerLevel}\n` +  
                        `👍 **Likes Before:** ${LikesbeforeCommand}\n` +
                        `🔥 **Likes After:** ${LikesafterCommand}\n` +
                        `💎 **Likes Given:** ${LikesGivenByAPI}\n` +`🎗️ **Please come back after 24 hours to claim your free like again✌️**\n`+
                        `📊 **Remaining Requests:** ${KeyRemainingRequests}`
                    )
                    .setColor('#00ff00')
                    .setTimestamp();

                return message.reply({ embeds: [embed] });

            } else if (data.status === 3) {
                const { message: errorMsg } = data;

                // Replace "Sri Lankan time" with "Bangladesh time (2:00 AM)"
                const modifiedMessage = errorMsg
                    .replace(/Sri Lankan time/gi, 'Bangladesh time')
                    .replace(/1:30 AM/gi, '2:00 AM');

                const embed = new EmbedBuilder()
                    .setTitle('⚠️ Like Already Given Today')
                    .setDescription(`❌ ${modifiedMessage}`)
                    .setColor('#ff0000')
                    .setTimestamp();

                return message.reply({ embeds: [embed] });

            } else {
                return message.reply(`❌ Unexpected response from the API.\n**Status:** ${data.status}\n**Message:** ${data.message || 'No message'}`);
            }

        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            return message.reply(`Oops!😌 <@${userId}> System detected you've received 100 likes in last 24 hours. Please try again later.😓`);
        }
    },
};

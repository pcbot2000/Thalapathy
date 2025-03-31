const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { likecollection, likeuserconfig } = require('../../mongodb');

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
        const apiUrl = `https://brokenplayz23like.vercel.app/like?uid=${uid}&server_name=${country}`;

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
                    return message.reply(`❌ <@${userId}>, you have reached your daily like limit (**${userLimit}**). Please wait **24 hours** before claiming again.`);
                }
            }

            const response = await axios.get(apiUrl);
            const data = response.data;

            console.log('API Response:', data); // Debugging: Check response structure

            // Extract values directly (not from data.data)
            const {
                PlayerNickname = 'Unknown',
                LikesbeforeCommand = 0,
                LikesafterCommand = 0,
                UID = 'Unknown',
                status = 2
            } = data; // Use `data`, NOT `data.data`

            const LikesGiven = Math.max(0, LikesafterCommand - LikesbeforeCommand); // Prevent negative values

            if (LikesGiven <= 0) {
                return message.reply(`⚠️ **No likes were given** to **${PlayerNickname}** (UID: ${UID}). Either the limit was reached or an issue occurred, please try again after 2.00am Bangladesh Standard Time`);
            }

            await likecollection.updateOne(
                { userId },
                { $set: { lastUsed: currentTime }, $inc: { likesUsed: 1 } },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setTitle(`🎉 Booyah! 🎊 ${PlayerNickname}, you received **${LikesGiven}** likes! 🥳`)
                .setDescription(
                    `👤 **Player:** ${PlayerNickname}\n` +
                    `👍 **Likes Before:** ${LikesbeforeCommand}\n` +
                    `🔥 **Likes After:** ${LikesafterCommand}\n` +
                    `💎 **Total Likes Given:** ${LikesGiven}\n` +
                    `🎗️ **Please come back after 24 hours to claim your free like again ✌️**`
                )
                .setColor('#00ff00')
                .setTimestamp();

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            return message.reply(`❌ Oops! <@${userId}>, an error occurred while processing your request. Please try again later.`);
        }
    },
};
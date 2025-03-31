const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const allowedChannels = ['1355943977710391416', '987654321098765432']; // Add allowed channel IDs

module.exports = {
    name: 'ffacccheck',
    description: 'Check if a Free Fire account is banned.',
    execute: async (message, args) => {
        if (!allowedChannels.includes(message.channel.id)) {
            return message.reply('❌ This command can only be used in specific channels.');
        }

        if (args.length !== 1) {
            return message.reply('❌ Usage: `!ffacccheck <UID>`\nExample: `!ffacccheck 2349899077`');
        }

        const uid = args[0];
        const apiUrl = `https://brokenplayz23ban.vercel.app/api/ban_check/${uid}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status !== 'success') {
                return message.reply(`❌ Failed to check ban status for UID **${uid}**.`);
            }

            const isBanned = data.data.is_banned === 1;
            const period = data.data.period || 'NA';

            const embed = new EmbedBuilder()
                .setTitle(`🚨 Free Fire Ban Check - UID: ${uid}`)
                .setDescription(isBanned ? 
                    `⚠️ **This account is banned!**\n🔒 **Ban Period:** ${period} Months` : 
                    `✅ **This account is NOT banned!**`
                )
                .setColor(isBanned ? '#ff0000' : '#00ff00')
                .setImage(isBanned ? 
                    'https://cdn.discordapp.com/attachments/1227567434483896370/1352329253290639370/standard-1.gif?ex=67ea2483&is=67e8d303&hm=daf018aea0a4d3ca48b9ff41afbc80323106565eaf28b21b4780d9b50a1c327b&' : 
                    'https://cdn.discordapp.com/attachments/1227567434483896370/1352329253886361610/standard-2.gif?ex=67ea2483&is=67e8d303&hm=e39330602be1e841162738ce83cd6727174b9f8a3058f1c6ee36306db10af4e4&'
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            return message.reply(`❌ Failed to fetch ban status. Please check the UID and try again.`);
        }
    },
};
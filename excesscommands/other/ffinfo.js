const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const allowedChannels = ['1355943354336149735', '987654321098765432']; // Add allowed channel IDs

module.exports = {
  name: 'ffinfo',
  description: 'Get full Free Fire player profile information using UID.',
  execute: async (message, args) => {
    if (!allowedChannels.includes(message.channel.id)) {
      return message.reply('❌ This command can only be used in specific channels.');
    }

    if (args.length < 2) {
      return message.reply('❌ Usage: `!ffinfo <country> <UID>`\nExample: `!ffinfo bd 11349339253`');
    }

    const [country, uid] = args;
    const apiUrl = `https://ariiflexlabs-playerinfo-icxc.onrender.com/ff_info?uid=${uid}&region=${country}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      // If the API returns an error message, relay it.
      if (data.error) {
        return message.reply(`❌ ${data.error}`);
      }

      // Check if AccountInfo exists and has properties
      if (!data || !data.AccountInfo || Object.keys(data.AccountInfo).length === 0) {
        console.error('Raw API response:', data);
        return message.reply(`❌ No data found for UID **${uid}** in **${country.toUpperCase()}**.`);
      }

      const {
        AccountInfo,
        AccountProfileInfo,
        GuildInfo,
        captainBasicInfo,
        creditScoreInfo,
        petInfo,
        socialinfo
      } = data;

      const accountCreatedAt = AccountInfo.AccountCreateTime ? new Date(AccountInfo.AccountCreateTime * 1000).toLocaleString() : 'N/A';
      const accountLastLogin = AccountInfo.AccountLastLogin ? new Date(AccountInfo.AccountLastLogin * 1000).toLocaleString() : 'N/A';

      // Create the embed with a cleaner and more complete look
      const embed = new EmbedBuilder()
        .setTitle(`🎮 Free Fire Profile - ${AccountInfo.AccountName || 'Unknown'}`)
        .setAuthor({ name: 'Free Fire Lookup', iconURL: 'https://i.imgur.com/BmfOnwA.png' })
        .setDescription(`📍 **Server:** ${AccountInfo.AccountRegion || 'NA'}\n🆔 **UID:** ${uid}`)
        .setColor('#00ffcc')
        .setThumbnail(`https://example.com/avatars/${AccountInfo.AccountAvatarId || 'default'}.png`)
        .setTimestamp();

      // --- Basic Info ---
      embed.addFields(
        { name: '🔰 Account Level', value: `${AccountInfo.AccountLevel}`, inline: true },
        { name: '⭐ EXP', value: `${AccountInfo.AccountEXP}`, inline: true },
        { name: '👍 Likes', value: `${AccountInfo.AccountLikes}`, inline: true },
        { name: '📅 Created At', value: accountCreatedAt, inline: true },
        { name: '🕒 Last Login', value: accountLastLogin, inline: true }
      );

      // --- Ranking Info ---
      embed.addFields(
        { name: '🏆 BR Max Rank', value: `${AccountInfo.BrMaxRank || 'N/A'}`, inline: true },
        { name: '🏆 CS Max Rank', value: `${AccountInfo.CsMaxRank || 'N/A'}`, inline: true },
        { name: '🎖️ BR Rank Points', value: `${AccountInfo.BrRankPoint || 'N/A'}`, inline: true },
        { name: '🎖️ CS Rank Points', value: `${AccountInfo.CsRankPoint || 'N/A'}`, inline: true }
      );

      // --- Weapons and Outfits ---
      embed.addFields(
        { name: '🛡️ Equipped Weapons', value: AccountInfo.EquippedWeapon?.length ? AccountInfo.EquippedWeapon.join(', ') : 'None', inline: false },
        { name: '👕 Equipped Outfit', value: AccountProfileInfo.EquippedOutfit?.length ? AccountProfileInfo.EquippedOutfit.join(', ') : 'None', inline: false },
        { name: '⚡ Equipped Skills', value: AccountProfileInfo.EquippedSkills?.length ? AccountProfileInfo.EquippedSkills.join(', ') : 'None', inline: false }
      );

      // --- Guild Info ---
      embed.addFields({
        name: '👥 Guild Info',
        value: `**Name:** ${GuildInfo.GuildName || 'N/A'}\n**Level:** ${GuildInfo.GuildLevel || 'N/A'}\n**Capacity:** ${GuildInfo.GuildCapacity || 'N/A'}\n**Owner:** ${GuildInfo.GuildOwner || 'N/A'}`,
        inline: false,
      });

      // --- Captain Info ---
      embed.addFields({
        name: '🚀 Captain Info',
        value: `**Rank:** ${captainBasicInfo.rank || 'N/A'}\n**Max Rank:** ${captainBasicInfo.maxRank || 'N/A'}\n**Badge Count:** ${captainBasicInfo.badgeCnt || 'N/A'}\n**Nickname:** ${captainBasicInfo.nickname || 'N/A'}\n**Created At:** ${captainBasicInfo.createAt ? new Date(captainBasicInfo.createAt * 1000).toLocaleString() : 'N/A'}`,
        inline: false,
      });

      // --- Credit Score Info ---
      embed.addFields(
        { name: '💳 Honor Score', value: `${creditScoreInfo.creditScore || 'N/A'}`, inline: true },
        { name: '🎟️ Reward State', value: `${creditScoreInfo.rewardState || 'N/A'}`, inline: true }
      );

      // --- Pet Info ---
      embed.addFields({
        name: '🐾 Pet Info',
        value: `**Name:** ${petInfo.name || 'N/A'}\n**Level:** ${petInfo.level || 'N/A'}\n**EXP:** ${petInfo.exp || 'N/A'}\n**Selected Skill ID:** ${petInfo.selectedSkillId || 'N/A'}`,
        inline: false,
      });

      // --- Social Info ---
      embed.addFields({
        name: '💬 Social Info',
        value: `**Signature:** ${socialinfo.AccountSignature || 'N/A'}\n**Language:** ${socialinfo.AccountLanguage || 'N/A'}\n**Prefer Mode:** ${socialinfo.AccountPreferMode || 'N/A'}`,
        inline: false,
      });

      // --- New Footer and Social Links ---
      embed.addFields(
        { name: '🌟 **Folllow Us!**', value: ' [YouTube](https://www.youtube.com/@BrokenPlayz23) |  [Telegram](https://t.me/goldserver23) |  [TikTok](https://www.tiktok.com/@brokenplayz23_) |  [Instagram](https://www.instagram.com/brokenplayz23/) |  [Facebook](https://www.facebook.com/brokenplayz233/)', inline: true },
        { name: '🎯 **Join Our Community!**', value: '💬 Chat with us, get updates, and have fun! 🚀' }
      );

      embed.setFooter({ text: '🔥 Stay Legendary with BrokenPlayz! 🔥' });

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      return message.reply(`❌ Failed to fetch player info. Please check the UID and try again.`);
    }
  },
};

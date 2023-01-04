const config = require("./config.json");
const { Client, Events, ActivityType, EmbedBuilder, IntentsBitField, PermissionsBitField } = require('discord.js');
const Intents = new IntentsBitField(3276799);
const bot = new Client({ intents: Intents });

bot.login(config.BOT_TOKEN).then( token => {
  console.log(`Logowanie przy użyciu tokenu: ${token}`)
});

bot.once(Events.ClientReady, b => {
  console.log(`Zalogowano jako: ${b.user.tag}!`);
  bot.user.setActivity(config.LISTENING_TO, {
    type: ActivityType.Listening,
  });
});

bot.on(Events.GuildMemberAdd, member => {
    if(bot.guilds.cache.get(config.SERVER_ID)) {
        const onJoinChannel = bot.channels.cache.get(config.ON_JOIN_EMBED_CHANNEL);
        const onJoinEmbed = new EmbedBuilder()
            .setColor(`Red`)
            .setTitle(`${config.ON_JOIN_EMBED_TITLE}`)
            .setDescription(`Użytkownik ${member} dołącza do ${member.guild.name}`)
            .setFooter(
                {
                    text: `${member.guild.name} wita!`,
                    iconURL: `${config.ON_JOIN_EMBED_FOOTER_IMG}`
                }
            );
        onJoinChannel.send({ embeds: [onJoinEmbed]});
        return member.roles.add(member.guild.roles.cache.get(config.ON_JOIN_ROLE_ID));
    }
});

bot.on(Events.VoiceStateUpdate, (vChannel) => {
    if(vChannel.member.voice.channelId === config.vCHANNEL_CREATOR_CHANNEL_ID) {
        vChannel.guild.channels.create(
            {
                name: `🔊 vKanał (${vChannel.member.user.username})`,
                type: 2,
                bitrate: 96000,
                videoQualityMode: 1,
                parent: config.vCHANNELS_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: vChannel.member.id,
                        allow: [PermissionsBitField.Flags.ManageChannels],
                    },
                ],
            }
        ).then(transfer => vChannel.member.voice.setChannel(transfer.id));
    } else if(vChannel.channelId !== null && vChannel.channel.members.size !== null && vChannel.channelId !== config.vCHANNEL_CREATOR_CHANNEL_ID) {
        if(vChannel.channel.members.size === 0 && vChannel.channel.parentId === config.vCHANNELS_CATEGORY_ID) {
          vChannel.channel.delete();
        }
    }
});

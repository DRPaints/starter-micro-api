const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { addPlaylistFields, getEmbedPanel, getDefaultPanelComponents, getDefaultChannel, getPanelMessage } = require("../classes/InteractionControl")
const { GuildChannels } = require("../classes/DatabaseConfig")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Mostrar o Painel de Reprodução'),
    async execute(interaction, client) {
        // await interaction.deferReply()

        try {
            var GuildChannel = await GuildChannels.findOne({
                where: {
                    guild_id: interaction.guild.id,
                    type: 'default'
                }
            })

            if (GuildChannel) {
                let panelMessage = await getPanelMessage(interaction.guild.id)

                if (panelMessage) {
                    if (panelMessage.author.id == interaction.client.user.id) {
                        const alreadyExistsEmbed = new EmbedBuilder()
                            .setColor(0xFF5F15)
                            .setDescription(`O Painel de Reprodução já está sendo apresentado no canal [${panelMessage.channel.name}](https://discord.com/channels/${panelMessage.channel.guild.id}/${panelMessage.channel.id})`)

                        await interaction.reply({ embeds: [alreadyExistsEmbed], ephemeral: true })
                        return
                    }
                }

                global.isRadio[interaction.guild.id] = false
                global.isInfinity[interaction.guild.id] = false
                global.isRepeatRandom[interaction.guild.id] = false
                global.isRepeatOnce[interaction.guild.id] = false

                let channel = await getDefaultChannel(interaction.guild.id)

                if (channel.id == interaction.channel.id) {
                    await interaction.reply({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()), components: getDefaultPanelComponents() })
                } else {
                    global.isRadio[interaction.guild.id] = false
                    global.isInfinity[interaction.guild.id] = false
                    global.isRepeatRandom[interaction.guild.id] = false
                    global.isRepeatOnce[interaction.guild.id] = false

                    const createdEmbed = new EmbedBuilder()
                        .setColor(0xFF5F15)
                        .setDescription(`O Painel de Reprodução foi inserido no canal [${channel.name}](https://discord.com/channels/${channel.guild.id}/${channel.id})`)

                    await interaction.reply({ embeds: [createdEmbed], ephemeral: true })
                    await channel.send({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()), components: getDefaultPanelComponents() })
                }
            } else {
                const noChannelEmbed = new EmbedBuilder()
                    .setColor(0xFF5F15)
                    .setDescription('O canal do Painel de Reprodução ainda não foi definido nesse servidor. (/help para mais informações)')

                await interaction.reply({ embeds: [noChannelEmbed], ephemeral: true })
            }
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF5F15)
                .setDescription(`Não foi possível mostrar o Painel de Reprodução. (Motivo: ${error.message})`)

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
    }
}

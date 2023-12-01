const { SlashCommandBuilder, ChannelSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")
const { GuildChannels } = require("../classes/DatabaseConfig")
const { getPanelMessage, getDefaultChannel, addPlaylistFields, getEmbedPanel, getDefaultPanelComponents } = require("../classes/InteractionControl")

// Gerenciar Servidor

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Definir o canal padrão do Musicador')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction, client) {
        // await interaction.deferReply()

        try {
            let channel = await getDefaultChannel(interaction.guild.id)

            if (!channel) {
                channel = await interaction.guild.channels.create({
                    name: 'musicas',
                    type: ChannelType.GuildText
                })

                const createdEmbed = new EmbedBuilder()
                    .setColor(0xFF5F15)
                    .setDescription(`Criado com sucesso o canal [${channel.name}](https://discord.com/channels/${channel.guild.id}/${channel.id}) como padrão do Musicador! O Painel de Reprodução será inserido nesse canal caso não esteja.`)

                await interaction.reply({ embeds: [createdEmbed], ephemeral: true })
            } else {
                const alreadyExistsEmbed = new EmbedBuilder()
                    .setColor(0xFF5F15)
                    .setDescription(`O canal [${channel.name}](https://discord.com/channels/${channel.guild.id}/${channel.id}) já está definido como padrão do Musicador! O Painel de Reprodução será inserido nesse canal caso não esteja.`)

                await interaction.reply({ embeds: [alreadyExistsEmbed], ephemeral: true })
            }

            var GuildChannel = await GuildChannels.findOne({
                where: {
                    guild_id: interaction.guild.id,
                    type: 'default'
                }
            })

            if (GuildChannel) {
                GuildChannel.channel_id = channel.id
                await GuildChannel.save()
            } else {
                GuildChannel = await GuildChannels.create({ guild_id: interaction.guild.id, channel_id: channel.id, type: 'default' })
            }

            const panelMessage = await getPanelMessage(interaction.guild.id)
            if (!panelMessage) {
                await channel.send({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()), components: getDefaultPanelComponents() })
            }
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF5F15)
                .setDescription(`Não foi possível definir o canal padrão do Musicador. (Motivo: ${error.message})`)

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
    }
}

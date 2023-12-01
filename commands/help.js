const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")



module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Comandos da lista de reprodução'),
    async execute(interaction, client) {
        // await interaction.deferReply()

        const queueEmbed = new EmbedBuilder()
            .setColor(0xFF5F15)
            .setTitle('⚙️ Comandos da Lista de Reprodução')
            .addFields(
                { name: '\u200B', value: '**/panel:** Adiciona o Painel de Reprodução no chat.' },
            )

        await interaction.reply({ embeds: [queueEmbed], ephemeral: true })
    }
}

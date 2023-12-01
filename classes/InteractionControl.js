const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js")
const { GuildChannels } = require("./DatabaseConfig");

const radioInfo = [
    {
        name: "NON STOP PLAY",
        url: "https://www.nonstopplay.com",
        streams: [
            { name: "Rhythm & Dance", stream: "http://stream.nonstopplay.co.uk/nsp-192k-mp3", default: true },
        ]
    },
    {
        name: "ENERGY FM",
        url: "https://www.energyfm.co.uk",
        streams: [
            { name: "Old School", stream: "https://radio.streemlion.com:1875/stream" },
            { name: "Non-Stop Mixes", stream: "https://radio.streemlion.com:2365/stream" },
        ]
    },
    {
        name: "PulsRadio",
        url: "https://www.pulsradio.com",
        streams: [
            { name: "Dance", stream: "https://listen.openstream.co/6036/audio" },
            // { name: "Trance", stream: "https://listen.openstream.co/6021/audio" },
            { name: "Lounge", stream: "https://listen.openstream.co/6044/audio" },
            { name: "2000", stream: "https://listen.openstream.co/6056/audio" },
            { name: "80", stream: "https://listen.openstream.co/6048/audio" },
            // { name: "90", stream: "https://listen.openstream.co/6046/audio" },
            { name: "Club", stream: "https://listen.openstream.co/6052/audio" },
            { name: "Hits UK", stream: "https://listen.openstream.co/6057/audio" },
            { name: "Hits H", stream: "https://listen.openstream.co/6042/audio" },
        ]
    },
    {
        name: "GTA SA",
        url: "https://play.smolyakov.dev/en/sa",
        streams: [
            // { name: "BOUNCE FM", stream: "https://play.smolyakov.dev/stream/sa/bounce-fm" },
            // { name: "CSR 103.9", stream: "https://play.smolyakov.dev/stream/sa/csr" },
            // { name: "K-DST", stream: "https://play.smolyakov.dev/stream/sa/k-dst" },
            // { name: "K-JAH WEST", stream: "https://play.smolyakov.dev/stream/sa/k-jah" },
            { name: "K-ROSE", stream: "https://play.smolyakov.dev/stream/sa/k-rose" },
            // { name: "MASTER SOUNDS 98.3", stream: "https://play.smolyakov.dev/stream/sa/master-sounds" },
            { name: "PLAYBACK FM", stream: "https://play.smolyakov.dev/stream/sa/playback-fm" },
            { name: "RADIO LOS SANTOS", stream: "https://play.smolyakov.dev/stream/sa/radio-los-santos" },
            { name: "RADIO X", stream: "https://play.smolyakov.dev/stream/sa/radio-x" },
            // { name: "SF-UR", stream: "https://play.smolyakov.dev/stream/sa/sfur" },
            // { name: "WCTR", stream: "https://play.smolyakov.dev/stream/sa/wctr" },
        ]
    },
    {
        name: "RADIO BR",
        url: "https://radiosaovivo.net",
        streams: [
            { name: "Metropolitana FM (São Paulo)", stream: "https://ice.fabricahost.com.br/metropolitana985sp" },
            { name: "Clube FM (Brasília)", stream: "https://8157.brasilstream.com.br/stream?origem=radiosaovivo" },
        ]
    },
    {
        name: "DUMONT",
        url: "https://www.dumontfm.com.br",
        streams: [
            { name: "104.3 FM", stream: "https://rrdns-dumont.webnow.com.br/dumont.mp3" },
        ]
    },
    {
        name: "HARDSTYLE",
        url: "https://br.radio.net/genre/hardstyle",
        streams: [
            { name: "Freaky Beats", stream: "https://1freakybeats.stream.laut.fm/1freakybeats" },
            { name: "Glass Dome Harderstylez", stream: "https://glass-dome-harderstylez.stream.laut.fm/glass-dome-harderstylez" },
            { name: "Stream Plus", stream: "https://server32109.streamplus.de/stream.mp3" },
            { name: "Radio Hardstyle", stream: "https://radiohardstyle.stream.laut.fm/radiohardstyle" },
            { name: "Everest Cast", stream: "https://everestcast.live-streams.nl:8025/stream" },
            { name: "Fire-Force-Radio", stream: "https://sp.fire-force-radio.de/listen/fire-force-radio/radio.mp3" },
            { name: "Tekknosucht", stream: "https://tekknosucht.stream.laut.fm/tekknosucht" },
        ]
    },
    {
        name: 'LOFI',
        url: "https://br.radio.net/search?q=lofi",
        streams: [
            { name: "Lofi 24/7", stream: "https://live.proradiosonline.com/listen/lofi_radio/aac" }
        ]
    }
];

const back = new ButtonBuilder()
    .setCustomId('back')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139239285921435860')

const pauseResume = new ButtonBuilder()
    .setCustomId('pauseResume')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139254365148938371')

const skip = new ButtonBuilder()
    .setCustomId('skip')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139239284667338833')

const add = new ButtonBuilder()
    .setCustomId('add')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139599128830156842')

const repeatOnce = new ButtonBuilder()
    .setCustomId('repeatOnce')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1149344639086776453')

const stop = new ButtonBuilder()
    .setCustomId('stop')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('1139239297296384020')

const repeatRandom = new ButtonBuilder()
    .setCustomId('repeatRandom')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1149345315892236329')

const infinity = new ButtonBuilder()
    .setCustomId('infinity')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139239300798632098')

const radio = new ButtonBuilder()
    .setCustomId('radio')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1139657469283536956')

const radioOptions = new StringSelectMenuBuilder()
    .setCustomId('radioSelect')
    .setPlaceholder('Escolha sua rádio!')

const repeatHistory = new ButtonBuilder()
    .setCustomId('repeatHistory')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1143631986330697739')

radioInfo.forEach(radio => {
    radio.streams.forEach(stream => {
        radioOptions.addOptions(new StringSelectMenuOptionBuilder()
            .setLabel(`${radio.name} - ${stream.name}`)
            .setValue(stream.stream)
            .setDefault(stream.default ?? false));
    });
})

// spaces
// new ButtonBuilder().setCustomId('space0').setLabel('\u200B').setStyle(ButtonStyle.Secondary).setDisabled(true)
// new ButtonBuilder().setCustomId('space1').setLabel('\u200B').setStyle(ButtonStyle.Secondary).setDisabled(true)

const panelRow0 = new ActionRowBuilder()
    .addComponents(back, pauseResume, skip)
const panelRow1 = new ActionRowBuilder()
    .addComponents(add, radio, infinity)
const panelRow2 = new ActionRowBuilder()
    .addComponents(repeatOnce, stop, repeatRandom)
const panelRow3 = new ActionRowBuilder()
    .addComponents(radioOptions)
const repeatHistoryRow0 = new ActionRowBuilder()
    .addComponents(repeatHistory)

function getDefaultPanelComponents(radioOptions = false, infinityActive = null) {
    if (radioOptions) {
        return [panelRow0, panelRow1, panelRow2, panelRow3]
    }

    radio.setEmoji('1139657469283536956')

    if (infinityActive) {
        infinity.setEmoji('1139643440179716146')
    } else {
        infinity.setEmoji('1139239300798632098')
    }

    back.setDisabled(false)
    pauseResume.setDisabled(false)
    skip.setDisabled(false)
    add.setDisabled(false)
    radio.setDisabled(false)
    infinity.setDisabled(false)
    repeatOnce.setDisabled(false)
    stop.setDisabled(false)
    repeatRandom.setDisabled(false)

    return [panelRow0, panelRow1, panelRow2]
}

function getRepeatHistoryComponents() {
    return [repeatHistoryRow0]
}

async function getPanelMessage(guildId) {
    const channel = await getDefaultChannel(guildId)
    const messages = await channel.messages.fetch({ limit: 2 })
    let panelMessage = null

    await messages.forEach((message) => {
        if (message.embeds[0]) {
            if (message.embeds[0].title == '<:music:1139599128830156842> Painel de Reprodução <:music:1139599128830156842>') {
                panelMessage = message
                return
            }
        }
    });

    return panelMessage
}

async function getDefaultChannel(guildId) {
    var GuildChannel = await GuildChannels.findOne({
        where: {
            guild_id: guildId,
            type: 'default'
        }
    })

    let channel = null
    if (GuildChannel) {
        channel = global.client.channels.cache.get(GuildChannel.channel_id)
    }

    return channel
}

function generateSmoothRainbowColors(steps) {
    const rainbowColors = [];
    const colorCount = steps * 6; // 6 cores no espectro de arco-íris

    for (let i = 0; i < colorCount; i++) {
        const red = Math.sin((Math.PI / colorCount) * i + 0) * 127 + 128;
        const green = Math.sin((Math.PI / colorCount) * i + (2 * Math.PI) / 3) * 127 + 128;
        const blue = Math.sin((Math.PI / colorCount) * i + (4 * Math.PI) / 3) * 127 + 128;

        // Combine os valores de cor em uma única cor
        const color = (Math.round(red) << 16) | (Math.round(green) << 8) | Math.round(blue);

        rainbowColors.push(color);
    }

    return rainbowColors;
}

async function changeColor(color) {
    Object.keys(global.players).forEach(async (key) => {
        const panel = await getPanelMessage(key)
        panel.embeds[0].data.color = color
        panel.edit({ embeds: panel.embeds, components: panel.components })
    });
}

function getEmbedPanel() {
    const embed = new EmbedBuilder()
        .setColor(0xFF5F15)
        .setTitle('<:music:1139599128830156842> Painel de Reprodução <:music:1139599128830156842>')

    // let currentIndex = 0;
    // const smoothRainbowColors = generateSmoothRainbowColors(10);

    // let checking = false
    // // Iniciar o loop para atualizar a cor do cargo
    // setInterval(async () => {
    //     const color = smoothRainbowColors[currentIndex];

    //     await changeColor(color)

    //     currentIndex = (currentIndex + 1) % smoothRainbowColors.length;
    // }, 1000); // Atualiza a cada segundo

    return embed
}

function addPlaylistFields(guildId, first_embed, showPlaying = true) {
    let embed_control = 0
    let embeds = [first_embed]
    let embed = embeds.slice(-1)[0]

    if (global.isRadio[guildId]) {
        radioInfo.forEach(radio => {
            radio.streams.forEach(stream => {
                if (stream.stream == global.isRadio[guildId]) {
                    embed.addFields(
                        { name: '\u200B', value: `<a:Doggodance:1144027152694644896> **[${radio.name}!](${radio.url})** <a:Doggodance:1144027152694644896>`, inline: true },
                    )
                }
            });
        });
    } else if (global.playlists[guildId]) {
        const symbolRegex = /[^A-Za-z0-9À-ÖØ-öø-ÿ\- ]/g
        global.playlists[guildId].forEach((element, index) => {
            if (embed_control == 8) {
                embeds.push(new EmbedBuilder().setColor(0xFF5F15))
                embed = embeds.slice(-1)[0]
                embed_control = 0
            }

            let isPlaying = showPlaying && (element.playing || global.playlists[guildId].length == 1)
            if (index == 0) {
                embed.addFields(
                    { name: '**Reprodução**', value: `${isPlaying ? `**${element.paused ? '<:pause:1139254365148938371>' : '<a:Doggodance:1144027152694644896>'}` : ''} #${index + 1} - [${element.info.video_details.title.replace(symbolRegex, '')}](${element.url}) ${isPlaying ? '**' : ''}`, inline: true },
                    { name: '**Adicionado por**', value: `<@${element.userId}>`, inline: true },
                    { name: '**Duração**', value: "```" + element.info.video_details.durationRaw + "```", inline: true },
                )
            } else {
                embed.addFields(
                    { name: '\u200B', value: `${isPlaying ? `**${element.paused ? '<:pause:1139254365148938371>' : '<a:Doggodance:1144027152694644896>'}` : ''} #${index + 1} - [${element.info.video_details.title.replace(symbolRegex, '')}](${element.url}) ${isPlaying ? '**' : ''}`, inline: true },
                    { name: '\u200B', value: `<@${element.userId}>`, inline: true },
                    { name: '\u200B', value: "```" + element.info.video_details.durationRaw + "```", inline: true },
                )
            }

            embed_control++
        })

        if (!showPlaying) {
            embed.setFooter({ text: `O Musicador • ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}` })
        }
    }

    return embeds
}

module.exports = { addPlaylistFields, getDefaultPanelComponents, getEmbedPanel, getPanelMessage, getDefaultChannel, getRepeatHistoryComponents }
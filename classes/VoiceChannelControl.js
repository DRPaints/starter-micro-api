const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require("@discordjs/voice")
const { updateActivity } = require("./ActivityControl")
const { startPlayList } = require("./PlaylistControl")

async function connectVoiceChannel(voiceChannel) {
    global.connections.set(voiceChannel.guild.id, joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    }))

    global.players[voiceChannel.guild.id] = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    })

    global.players[voiceChannel.guild.id].on(AudioPlayerStatus.Idle, async () => {
        let playingPlayStream = global.playlists[voiceChannel.guild.id].filter(element => element.playing)[0]

        if (playingPlayStream) {
            if (!global.isRepeatRandom[voiceChannel.guild.id] && !global.isRepeatOnce[voiceChannel.guild.id]) {
                playingPlayStream.playing = false
                playingPlayStream.played = true
            }
        }

        await startPlayList(voiceChannel.guild.id)
    })

    global.players[voiceChannel.guild.id].on(AudioPlayerStatus.Paused, async () => {
        let playingPlayStream = global.playlists[voiceChannel.guild.id].filter(element => element.playing)[0]

        if (playingPlayStream) {
            playingPlayStream.paused = true
        }
    })

    global.players[voiceChannel.guild.id].on(AudioPlayerStatus.Playing, async () => {
        let playingPlayStream = global.playlists[voiceChannel.guild.id].filter(element => element.playing)[0]

        if (playingPlayStream) {
            playingPlayStream.paused = false
        }
    })

    updateActivity()
}

module.exports = { connectVoiceChannel }
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const { EmbedBuilder } = require('discord.js')
const play = require('play-dl')
const fs = require('fs');
const ytdl = require('ytdl-core');
const { addPlaylistFields, getDefaultPanelComponents, getEmbedPanel, getPanelMessage, getDefaultChannel, getRepeatHistoryComponents } = require('./InteractionControl')
const { searchQuery } = require('./SearchControl')
const { updateActivity } = require('./ActivityControl')

async function destroyConnection(guildId, keepPanel = false, playlistLimitReached = false) {
  if (global.connections.get(guildId) && !playlistLimitReached) {
    global.connections.get(guildId).destroy()
    global.connections.delete(guildId)
  }

  updateActivity()

  global.isRadio[guildId] = null

  if (!playlistLimitReached) {
    global.isInfinity[guildId] = false
    global.isRepeatOnce[guildId] = false
    global.isRepeatRandom[guildId] = false
  } else {
    var nextPlaylist = global.playlists[guildId].pop()
  }

  const channel = await getDefaultChannel(guildId)

  if (global.playlists[guildId].length > 0) {
    const historyEmbeds = addPlaylistFields(guildId, new EmbedBuilder()
      .setColor(0xFF5F15)
      .setTitle('<:music:1139599128830156842> Histórico de Reprodução <:music:1139599128830156842>'), false)

    global.playlists[guildId] = []

    channel.send({ embeds: historyEmbeds, components: getRepeatHistoryComponents() })
  }

  let panelMessage = await getPanelMessage(guildId)

  if (!keepPanel) {
    if (panelMessage) {
      await panelMessage.delete()
    }

    await channel.send({ embeds: [getEmbedPanel()], components: getDefaultPanelComponents(false, global.isInfinity[guildId]) })
  }

  if (playlistLimitReached) {
    addToPlayList(guildId, nextPlaylist.url, nextPlaylist.info, nextPlaylist.userId, true)
  }
}

async function addToPlayList(guildId, url, info, userId, forceStart = false, updatePanelMessage = true, repeatHistory = false) {
  if (!global.playlists[guildId]) {
    global.playlists[guildId] = []
  }

  const index = global.playlists[guildId].push(
    {
      url: url,
      info: info,
      userId: userId,
      playing: false,
      played: false
    }
  )

  if (global.playlists[guildId].length > global.playlistLimit) {
    stopPlayList(guildId, false, true)
  } else {
    if (!repeatHistory) {
      if ((global.players[guildId].state.status == AudioPlayerStatus.Idle) || forceStart) {
        await startPlayList(guildId, updatePanelMessage)
      }
    }
  }

  return index
}

async function startPlayList(guildId, updatePanelMessage = true) {
  if (global.connections.get(guildId)) {
    if (global.isRadio[guildId]) {
      global.playlists[guildId] = []

      const resource = createAudioResource(global.isRadio[guildId], {
        inlineVolume: true
      })

      global.players[guildId].play(resource)
      global.connections.get(guildId).subscribe(global.players[guildId])
    } else {
      if (global.isRepeatRandom[guildId]) {
        const notPlaying = global.playlists[guildId].filter(element => !element.playing)

        let playingPlayStream = global.playlists[guildId].filter(element => element.playing)[0]
        if (playingPlayStream) {
          playingPlayStream.playing = false
        }

        const random = Math.floor(Math.random() * notPlaying.length)
        nextPlayStream = notPlaying[random]
      } else {
        nextPlayStream = global.playlists[guildId].filter(element => !element.played)[0]
      }

      if (nextPlayStream) {
        const stream = await play.stream(nextPlayStream.url)
        // const stream = ytdl.chooseFormat(nextPlayStream.info.formats, { quality: 'highestaudio' });

        let resource = createAudioResource(stream.stream, {
          inputType: stream.type
        })

        global.players[guildId].play(resource)
        global.connections.get(guildId).subscribe(global.players[guildId])

        nextPlayStream.playing = true

        if (updatePanelMessage) {
          let panelMessage = await getPanelMessage(guildId)

          if (panelMessage) {
            await panelMessage.edit({ embeds: addPlaylistFields(guildId, getEmbedPanel()) })
          } else {
            const channel = await getDefaultChannel(guildId)
            await channel.send({ embeds: addPlaylistFields(guildId, getEmbedPanel()) })
          }
        }

      } else if (global.isInfinity[guildId]) {
        const lastPlayed = global.playlists[guildId].filter(element => element.played).slice(-1)[0]

        if (!lastPlayed.info.video_details.durationInSec) {
          const lastPlayedSearch = await searchQuery(lastPlayed.url)

          lastPlayed.info.video_details.durationInSec = lastPlayedSearch.info.video_details.durationInSec
          lastPlayed.info.related_videos = lastPlayedSearch.info.related_videos
        }

        // let random = 0
        let searchInfo
        if (lastPlayed.info.video_details.durationInSec < 900) {
          do {
            const random = Math.floor(Math.random() * lastPlayed.info.related_videos.length);
            searchInfo = await searchQuery(lastPlayed.info.related_videos[random]) //.title
            // random++
          } while ((searchInfo.info.video_details.durationInSec <= 60) ||
          (searchInfo.info.video_details.durationInSec > 900) ||
          (global.playlists[guildId].filter(element => element.url == searchInfo.url).length > 0) ||
            (searchInfo.info.video_details.likes < 100000));
        } else {
          const random = Math.floor(Math.random() * lastPlayed.info.related_videos.length);
          searchInfo = await searchQuery(lastPlayed.info.related_videos[random]) //.title
        }

        await addToPlayList(guildId, searchInfo.url, searchInfo.info, '1077728351806042172', true)
      } else {
        destroyConnection(guildId)
      }
    }
  }
}

async function backPrevious(guildId) {
  playingPlayStream = global.playlists[guildId].filter(element => element.playing)[0]

  if (playingPlayStream) {
    playingPlayStream.playing = false
    playingPlayStream.paused = false
    playingPlayStream.played = false
  }

  playedPlayStream = global.playlists[guildId].filter(element => element.played).slice(-1)[0]

  if (playedPlayStream) {
    playedPlayStream.playing = false
    playingPlayStream.paused = false
    playedPlayStream.played = false
  }

  await startPlayList(guildId, false)
}

async function skipCurrent(guildId) {
  playingPlayStream = global.playlists[guildId].filter(element => element.playing)[0]

  if (playingPlayStream) {
    playingPlayStream.playing = false
    playingPlayStream.paused = false
    playingPlayStream.played = true
  }

  await startPlayList(guildId, false)
}

async function pauseCurrent(guildId) {
  if (global.players[guildId]) {
    await global.players[guildId].pause()
  }
}

async function resumeCurrent(guildId) {
  if (global.players[guildId]) {
    await global.players[guildId].unpause()
  }
}

async function stopPlayList(guildId, keepPanel = false, playlistLimitReached = false) {
  if (global.connections.get(guildId)) {
    await destroyConnection(guildId, keepPanel, playlistLimitReached)
  }
}

module.exports = { addToPlayList, startPlayList, skipCurrent, backPrevious, pauseCurrent, resumeCurrent, stopPlayList, destroyConnection }
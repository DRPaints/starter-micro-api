const fs = require('node:fs')
const path = require('node:path')
const { Client, Events, GatewayIntentBits, Collection, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ActivityType, EmbedBuilder } = require('discord.js')
const { createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, joinVoiceChannel } = require('@discordjs/voice')
// const { token } = require('./config.json')
const { startPlayList, pauseCurrent, resumeCurrent, stopPlayList, skipCurrent, backPrevious, addToPlayList } = require('./classes/PlaylistControl')
const { searchQuery } = require('./classes/SearchControl')
const { addPlaylistFields, getEmbedPanel, getDefaultChannel, getPanelMessage, getDefaultPanelComponents } = require('./classes/InteractionControl')
const { GuildChannels } = require('./classes/DatabaseConfig')
const { updateActivity } = require('./classes/ActivityControl')
const { connectVoiceChannel } = require('./classes/VoiceChannelControl')
var http = require('http');

const token = process.env.APPLICATION_TOKEN

global.client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ]
})

client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

global.playlistLimit = 40
global.guildId = null
global.isRadio = []
global.isInfinity = []
global.isRepeatOnce = []
global.isRepeatRandom = []
global.playlists = []
global.connections = new Map()
global.players = []

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

client.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`)

  updateActivity()
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName}`)
      return
    }

    try {
      await command.execute(interaction, client)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  } else if (interaction.isButton()) {
    try {
      const userChannel = interaction.member?.voice.channel
      const botConnection = global.connections.get(interaction.guild.id)

      if ((['add', 'repeatHistory'].includes(interaction.customId) || (interaction.customId == 'radio' && !global.isRadio[interaction.guild.id])) && !userChannel && !botConnection) {
        await interaction.reply({ content: 'Você precisa estar conectado em uma sala de voz para iniciar O Musicador.', ephemeral: true })
        return
      }

      if (((userChannel ? userChannel.id : 0) != (botConnection ? botConnection.joinConfig.channelId : -1)) &&
        (!['add', 'repeatHistory', 'radio'].includes(interaction.customId) || (interaction.customId == 'radio' && global.isRadio[interaction.guild.id]))) {
        await interaction.reply({ content: 'Você precisa estar na mesma sala do Musicador para manipular o Painel de Reprodução.', ephemeral: true })
        return
      }

      if (!botConnection && !['add', 'repeatHistory', 'radio'].includes(interaction.customId)) {
        await interaction.reply({ content: 'O Musicador não está reproduzindo nenhuma música no momento.', ephemeral: true })
        return
      }

      if ((interaction.customId == 'radio' && !global.isRadio[interaction.guild.id]) && (global.playlists[interaction.guild.id] ? global.playlists[interaction.guild.id].length : 0 > 0)) {
        await interaction.reply({ content: 'Não é possível ativar o modo rádio pois existem músicas em reprodução.', ephemeral: true })
        return
      }

      if (interaction.customId != 'add') {
        await interaction.deferUpdate()
      }

      switch (interaction.customId) {
        case 'pauseResume':
          if (global.players[interaction.guild.id].state.status == AudioPlayerStatus.Paused) {
            await resumeCurrent(interaction.guild.id)

            interaction.message.components[0].components[1].emoji.id = '1139254365148938371'
            interaction.message.components[0].components[1].emoji.name = 'pause'
          } else {
            await pauseCurrent(interaction.guild.id)

            interaction.message.components[0].components[1].emoji.id = '1139254366516293682'
            interaction.message.components[0].components[1].emoji.name = 'play'
          }
          break

        case 'skip':
          if (!global.isRadio[interaction.guild.id]) {
            await skipCurrent(interaction.guild.id)
          }
          break

        case 'back':
          if (!global.isRadio[interaction.guild.id]) {
            await backPrevious(interaction.guild.id)
          }
          break

        case 'add':
          if (!global.isRadio[interaction.guild.id]) {
            const modal = new ModalBuilder()
              .setCustomId('addModal')
              .setTitle('Adicionar na Lista de Reprodução')

            const queryInput = new TextInputBuilder()
              .setCustomId('queryInput')
              .setLabel("URL do Youtube ou descrição do vídeo")
              .setStyle(TextInputStyle.Short)

            const firstActionRow = new ActionRowBuilder().addComponents(queryInput)
            modal.addComponents(firstActionRow)

            await interaction.showModal(modal)

            return
          } else {
            await interaction.reply({ content: 'Não é possível adicionar músicas com o modo rádio ativo.', ephemeral: true })
            return
          }

        case 'repeatOnce':
          if (!global.isRadio[interaction.guild.id]) {
            global.isRepeatOnce[interaction.guild.id] = !global.isRepeatOnce[interaction.guild.id]

            if (global.isRepeatOnce[interaction.guild.id]) {
              interaction.message.components[2].components[0].emoji.id = '1149344644065402911'
              interaction.message.components[2].components[0].emoji.name = 'repeat_once_green'
            } else {
              interaction.message.components[2].components[0].emoji.id = '1149344639086776453'
              interaction.message.components[2].components[0].emoji.name = 'repeat_once'
            }
          }

          break
        case 'stop':
          if (global.connections.get(interaction.guild.id)) {
            await interaction.deleteReply()
            await stopPlayList(interaction.guild.id)

            return
          }
          break
        case 'repeatRandom':
          if (!global.isRadio[interaction.guild.id]) {
            global.isRepeatRandom[interaction.guild.id] = !global.isRepeatRandom[interaction.guild.id]

            if (global.isRepeatRandom[interaction.guild.id]) {
              interaction.message.components[2].components[2].emoji.id = '1149345317775474690'
              interaction.message.components[2].components[2].emoji.name = 'random_green'
            } else {
              interaction.message.components[2].components[2].emoji.id = '1149345315892236329'
              interaction.message.components[2].components[2].emoji.name = 'random'
            }
          }
          break
        case 'infinity':
          if (!global.isRadio[interaction.guild.id]) {
            global.isInfinity[interaction.guild.id] = !global.isInfinity[interaction.guild.id]

            if (global.isInfinity[interaction.guild.id]) {
              interaction.message.components[1].components[2].emoji.id = '1139643440179716146'
              interaction.message.components[1].components[2].emoji.name = 'infinity_green'
            } else {
              interaction.message.components[1].components[2].emoji.id = '1139239300798632098'
              interaction.message.components[1].components[2].emoji.name = 'infinity'
            }
          }

          break
        case 'radio':
          if (global.isRadio[interaction.guild.id]) {
            global.isRadio[interaction.guild.id] = null

            interaction.message.components.pop()

            await stopPlayList(interaction.guild.id, true)
          } else {
            global.isRadio[interaction.guild.id] = "http://stream.nonstopplay.co.uk/nsp-192k-mp3"

            if (!global.connections.get(interaction.guild.id)) {
              const voiceChannel = interaction.member?.voice.channel

              if (voiceChannel) {
                connectVoiceChannel(voiceChannel)
              }
            }

            await startPlayList(interaction.guild.id, false)
          }

          interaction.message.components = getDefaultPanelComponents(global.isRadio[interaction.guild.id] != null)

          interaction.message.components.forEach(element => {
            element.components.forEach(element => {
              if (element.data.custom_id == 'radio') {
                if (global.isRadio[interaction.guild.id] != null) {
                  element.data.emoji.id = '1139657735336644659'
                  element.data.emoji.name = 'radio_green'
                } else {
                  element.data.emoji.id = '1139657469283536956'
                  element.data.emoji.name = 'radio'
                }
              } else if (!['space0', 'space1', 'radioSelect'].includes(element.data.custom_id)) {
                element.data.disabled = (global.isRadio[interaction.guild.id] != null)
              }
            })
          })

          break

        case 'repeatHistory':
          await stopPlayList(interaction.guild.id)
          global.playlists[interaction.guild.id] = []

          let fieldAux = 0
          let url = ''
          let title = ''
          let durationRaw = ''
          let userId = ''
          const titleLinkRegex = /\[(.*?)\]\((.*?)\)/

          interaction.message.embeds.forEach(embed => {
            embed.fields.forEach(async field => {
              if (fieldAux == 0) {
                const match = field.value.match(titleLinkRegex);

                if (match && match.length > 2) {
                  title = match[1].trim()
                  url = match[2]
                } else {
                  url = ''
                  title = ''
                }

                fieldAux++
              } else if (fieldAux == 1) {
                userId = field.value.replace(/\D/g, '')
                fieldAux++
              } else if (fieldAux == 2) {
                durationRaw = field.value.replaceAll('`', '')
                fieldAux = 0
                addToPlayList(interaction.guild.id, url, {
                  video_details: {
                    title: title,
                    durationRaw: durationRaw
                  }
                }, userId, false, true, true)
              }
            });
          });

          if (!global.connections.get(interaction.guild.id)) {
            const voiceChannel = interaction.member?.voice.channel

            if (voiceChannel) {
              connectVoiceChannel(voiceChannel)
            }
          }

          await startPlayList(interaction.guild.id)

          return
        default:

          break
      }

      const channel = interaction.channel;
      const message = await channel.messages.cache.get(interaction.message.id);

      if (message) {
        await interaction.editReply({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()), components: interaction.message.components })
      }
    } catch (error) {
      console.log(error)
    }
  } else if (interaction.isModalSubmit()) {
    await interaction.deferUpdate()

    if (interaction.customId == 'addModal') {
      try {
        const searchInfo = await searchQuery(interaction.fields.getTextInputValue('queryInput'))

        if (searchInfo) {
          if (!global.connections.get(interaction.guild.id)) {
            const voiceChannel = interaction.member?.voice.channel

            if (voiceChannel) {
              connectVoiceChannel(voiceChannel)
            }
          }

          await addToPlayList(interaction.guild.id, searchInfo.url, searchInfo.info, interaction.member.user.id, false, false)
          await interaction.editReply({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()) })
        }
      } catch (error) {
        console.log(error)
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    await interaction.deferUpdate()

    if (interaction.customId == 'radioSelect') {
      try {
        global.isRadio[interaction.guild.id] = interaction.values[0]

        if (!global.connections.get(interaction.guild.id)) {
          const voiceChannel = interaction.member?.voice.channel

          if (voiceChannel) {
            connectVoiceChannel(voiceChannel)
          }
        }

        await startPlayList(interaction.guild.id, false)

        interaction.message.components[3].components[0].options.forEach(element => {
          element.default = (element.value == interaction.values[0])
        });

        await interaction.editReply({ embeds: addPlaylistFields(interaction.guild.id, getEmbedPanel()), components: interaction.message.components })
      } catch (error) {
        console.log(error)
      }
    }
  }
  else {
    return
  }
})

client.on(Events.MessageCreate, async message => {
  if (message.member) {
    if (message.member.user.bot && message.member.user.id == client.user.id) return

    try {
      const channel = await getDefaultChannel(message.guild.id)
      if (message.channelId == channel.id) {
        if (!message.content.startsWith(['/setdefault', '/help', '/panel'])) {
          if (message) {
            await message.delete()
          }
        }
      }
    } catch (error) {
      console.log(`SPAM DETECTED. (${error})`)
    }
  }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (global.connections.get(oldState.guild.id)) {
    if (oldState.channelId !== (global.connections.get(oldState.guild.id).joinConfig.channelId)) {
      return
    }

    if (((oldState.channel.members.size - 1) == 0) || (oldState.id == client.user.id)) {
      await stopPlayList(oldState.guild.id)
    }
  }
});

client.login(token)
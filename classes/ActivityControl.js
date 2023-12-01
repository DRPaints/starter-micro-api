const { ActivityType } = require("discord.js")

async function updateActivity() {
    try {
        const size = global.connections.size

        if (size > 0) {
            global.client.user.setActivity(`música | ${size} ${size == 1 ? 'servidor' : 'servidores'}`, {
                type: ActivityType.Listening,
            })
        } else {
            global.client.user.setActivity(`música`, {
                type: ActivityType.Listening,
            })
        }
    } catch (error) {
        console.log(error)

        global.client.user.setActivity(`música`, {
            type: ActivityType.Listening,
        })
    }
}

module.exports = { updateActivity }
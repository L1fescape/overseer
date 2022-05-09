import { Client, Intents, MessageEmbed } from 'discord.js'
import * as express from 'express'

import { onMessageHandler, onReadyHandler } from './discord/handlers'
import { getEnvVars } from './utils/envVars'

const { PORT, DISCORD_TOKEN } = getEnvVars()
const intents = new Intents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES])

const client = new Client({ intents })
client.on('ready', () => onReadyHandler(client))
client.on('message', onMessageHandler)

const server = express()
server.use('*', (_, res) => res.send('hi!'))
server.listen(PORT, function() {
  console.log('express server started on', PORT)
  client.login(DISCORD_TOKEN)
})

import { Client, Intents, MessageEmbed } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import * as express from 'express'

import { COMMANDS, ARGS, slashCommands, processCheater, processWhitelist } from './discord/commands'
import { getEmbed, asyncSendEmbed } from './discord/embed'
import { CHECK_PREFIX, playerInfoToString, processCheck, processCheckBulk } from './check'
import { getEnvVars } from './utils/envVars'

const { PORT, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DISCORD_TOKEN } = getEnvVars()
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)
const intents = new Intents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES])
const client = new Client({ intents })
const server = express()

client.on('ready', async () => {
  console.log(`Logged in to discord as ${client.user.tag}`)

  try {
    console.log('Started refreshing discord slash (/) commands')
    // unregister all previous slash commands
    const commandsRoute = Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
    await rest.get(commandsRoute)
      .then((data: any[]) => {
          const promises = [];
          for (const command of data) {
              promises.push(rest.delete(`/${commandsRoute}/${command.id}`))
          }
          return Promise.all(promises)
      })
    // register all slash commands
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: slashCommands },
    )
    console.log('Successfully reloaded discord slash (/) commands')
  } catch (error) {
    console.log('Error reloading discord slash (/) commands')
    console.error(error)
  }

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const command = interaction.commandName
    const steamUrl = interaction.options.getString(ARGS.SteamURL)
    const reporter = interaction.member.user.username

    let response: string

    switch (command) {
      case COMMANDS.Report:
        response = await processCheater(steamUrl, reporter)
        break
      case COMMANDS.Check:
        const player = await processCheck(steamUrl)
        response = player ? playerInfoToString(player) : 'Could not lookup user'
        break
      case COMMANDS.Whitelist:
        response = await processWhitelist(steamUrl, reporter)
        break
    }

    // @ts-ignore
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: response
        },
      },
    })
  })
})

client.on('message', async message => {
	if (message.author.bot) return

  const respMessage = await message.channel.send('Checking...')

	const input = message.content.trim()
  let embeds: MessageEmbed[] = []
  if (input.indexOf(CHECK_PREFIX) > -1) {
    const players = await processCheckBulk(input, message)
    embeds = players.map(player => getEmbed(player))
  } else if (input.indexOf('!check') === 0) {
    embeds.push(getEmbed(await processCheck(input, message)))
  }
  
  await Promise.all(embeds.map(embed => asyncSendEmbed(embed, message)))
  await respMessage.delete()
})

server.use('*', function(_, res) {
  res.send('hi!')
})

server.listen(PORT, function() {
  console.log('express server started on', PORT)
  client.login(DISCORD_TOKEN)
})

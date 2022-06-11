import { Client, Message, MessageEmbed, CommandInteraction } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

import { getEmbed, asyncSendEmbed } from './embed'
import { CHECK_PREFIX, STATUS_PREFIX, playerInfoToString, processCheck } from '../check'
import { COMMANDS, ARGS, slashCommands, processCheater, processWhitelist } from './commands'
import { getEnvVars } from '../utils/envVars'

const { DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DISCORD_TOKEN, DISCORD_ALLOWED_CHANNELS } = getEnvVars()
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)

export async function onReadyHandler(client: Client) {
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

  client.on('interactionCreate', onInteractionCreateHandler(client))
}

function onInteractionCreateHandler(client: Client) {
  return async function (interaction: CommandInteraction) {
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
        const players = await processCheck(steamUrl)
        response = players.length ? playerInfoToString(players[0]) : 'Could not lookup user'
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
  }
}

export async function onMessageHandler(message: Message) {
	const input = message.content.trim()

	if (message.author.bot) return
  if (input.indexOf(CHECK_PREFIX) !== 0 && input.indexOf(STATUS_PREFIX) !== 0) return

  if (DISCORD_ALLOWED_CHANNELS.length && DISCORD_ALLOWED_CHANNELS.indexOf(message.channelId) === -1) {
    await message.channel.send('Wrong channel dummy')
    return
  }

  const respMessage = await message.channel.send('Checking...')
  try {
    const players = await processCheck(input)
    const embeds: MessageEmbed[] = players.map(player => getEmbed(player))
    await Promise.all(embeds.map(embed => asyncSendEmbed(embed, message)))
  } catch (e) {
    await message.channel.send(`There was an error fetching stats: ${e.message}`)
  } finally {
    await respMessage.delete()
  }
}
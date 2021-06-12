import * as http from 'http'
import * as Discord from 'discord.js'
import { processCheck, processCheckBulk, playerInfoToString } from './check'
import { processCheater } from './cheater'
import { processWhitelist } from './whitelist'
import { getEmbed } from './embed'

const client = new Discord.Client()

const SERVER_ID = "205602433429143562"
const COMMAND_PREFIX = ''

const enum COMMANDS {
  Report = 'report',
  Check = 'check',
  Whitelist = 'whitelist',
}

const enum ARGS {
  SteamURL = 'steam_url',
}

interface SlashCommandArgument {
  value: string
  type: number
  name: string
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)

  const commands = [{
    name: `${COMMAND_PREFIX}${COMMANDS.Report}`,
    description: "Report a cheater",
    options: [{
      name: ARGS.SteamURL,
      description: "steam url or id",
      type: 3,
      required: true,
    }]
  }, {
    name: `${COMMAND_PREFIX}${COMMANDS.Check}`,
    description: "Check csgo stats",
    options: [{
      name: ARGS.SteamURL,
      description: "Steam URL, Steam ID, or output from `status` command",
      type: 3,
      required: true,
    }]
  }, {
    name: `${COMMAND_PREFIX}${COMMANDS.Whitelist}`,
    description: "Whitelist a player",
    options: [{
      name: ARGS.SteamURL,
      description: "steam url or id",
      type: 3,
      required: true,
    }]
  }]

  commands.forEach(commandData => (
    // @ts-ignore
    client.api.applications(client.user.id).guilds(SERVER_ID).commands.post({
      data: commandData,
    })
  ))
  // deregister commands
  // // @ts-ignore
  // const registeredCommands = await client.api.applications(client.user.id).guilds(SERVER_ID).commands.get()
  // // @ts-ignore
  // registeredCommands.forEach(commandData => {
  //   // @ts-ignore
  //   client.api.applications(client.user.id).guilds(SERVER_ID).commands(commandData.id).delete()
  // })

  // @ts-ignore
  client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase().replace(COMMAND_PREFIX, '')
    const args = interaction.data.options as SlashCommandArgument[]

    const steamUrl = args.find(arg => arg.name === ARGS.SteamURL).value
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

const asyncSendEmbed = async (embed: Discord.MessageEmbed, msg: Discord.Message) => msg.channel.send(embed)

client.on('message', async message => {
  const command = '!check'
	if (!message.content.startsWith(command) || message.author.bot) return;

  const respMessage = await message.channel.send('Checking...')

	const input = message.content.slice(command.length).trim()
  let embeds: Discord.MessageEmbed[] = []
  if (input.indexOf('#') !== -1) {
    const players = await processCheckBulk(input)
    embeds = players.map(player => getEmbed(player))
  } else {
    embeds.push(getEmbed(await processCheck(input)))
  }
  
  await Promise.all(embeds.map(embed => asyncSendEmbed(embed, message)))
  await respMessage.delete()
})


const server = http.createServer((_, res) => {
  res.writeHead(200);
  res.end("My first server!");
})
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
  client.login(process.env.DISCORD_TOKEN)
})
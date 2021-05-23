import * as http from 'http'
import * as Discord from 'discord.js'
import { processCheater, checkCheater } from './cheaters'

const client = new Discord.Client()

const SERVER_ID = "205602433429143562"

const enum COMMANDS {
  Report = 'report',
  Check = 'check',
}

const enum ARGS {
  SteamURL = 'steam_url',
}

interface SlashCommandArgument {
  value: string
  type: number
  name: string
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  const commands = [{
    name: COMMANDS.Report,
    description: "Report a cheater",
    options: [{
      name: ARGS.SteamURL,
      description: "Cheater's steam url or id that will be added to the list",
      type: 3,
      required: true,
    }]
  }, {
    name: COMMANDS.Check,
    description: "Check if a suspected cheater has been reported",
    options: [{
      name: ARGS.SteamURL,
      description: "Cheater's steam url or id that will be checked",
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

  // @ts-ignore
  client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options as SlashCommandArgument[]

    const steamUrl = args.find(arg => arg.name === ARGS.SteamURL).value
    const reporter = interaction.member.user.username

    let response

    switch (command) {
      case COMMANDS.Report:
        response = await processCheater(steamUrl, reporter)
        break
      case COMMANDS.Check:
        response = await checkCheater(steamUrl)
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

client.login(process.env.DISCORD_TOKEN)

const server = http.createServer((_, res) => {
  res.writeHead(200);
  res.end("My first server!");
})
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
})
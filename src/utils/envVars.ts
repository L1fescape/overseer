const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
const DISCORD_ALLOWED_CHANNELS_STR = process.env.DISCORD_ALLOWED_CHANNELS
const DISCORD_COMMAND_PREFIX = process.env.DISCORD_COMMAND_PREFIX || ''
const PORT = process.env.PORT || '3000'

interface EnvVars {
  DISCORD_TOKEN: string
  DISCORD_CLIENT_ID: string
  DISCORD_GUILD_ID: string
  DISCORD_ALLOWED_CHANNELS: string[]
  DISCORD_COMMAND_PREFIX: string
  PORT: string
}

export function getEnvVars(): EnvVars {
  let DISCORD_ALLOWED_CHANNELS: string[] = []

  if (!DISCORD_TOKEN) {
    console.log('DISCORD_TOKEN env var is not defined. Exiting.')
    process.exit(0)
  }

  if (!DISCORD_CLIENT_ID) {
    console.log('DISCORD_CLIENT_ID env var is not defined. Exiting.')
    process.exit(0)
  }

  if (!DISCORD_GUILD_ID) {
    console.log('DISCORD_GUILD_ID env var is not defined. Exiting.')
    process.exit(0)
  }

  if (DISCORD_ALLOWED_CHANNELS_STR) {
    DISCORD_ALLOWED_CHANNELS = DISCORD_ALLOWED_CHANNELS_STR.split(',')
  }

  return {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    DISCORD_ALLOWED_CHANNELS,
    DISCORD_COMMAND_PREFIX,
    PORT,
  }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
const PORT = process.env.PORT || '3000'

interface EnvVars {
  DISCORD_TOKEN: string
  DISCORD_CLIENT_ID: string
  DISCORD_GUILD_ID: string
  PORT: string
}

export function getEnvVars(): EnvVars {
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

  return {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    PORT,
  }
}

import axios from 'axios'
import * as SteamID from 'steamid'

const STEAM_API_KEY = process.env.STEAM_API_KEY

const vanityCheckURL =
  'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/'

const usernameURL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/'

async function getVanity(steamId: string) {
  if (!STEAM_API_KEY) {
    console.error('steam api key not provided')
    return null
  }

  const params = {
    key: process.env.STEAM_API_KEY,
    vanityurl: steamId,
  }

  const { data } = await axios.get(vanityCheckURL, {
    params,
  })

  if (data.response.success) {
    return data.response.steamid
  } else {
    console.log("error", data)
  }

  return null
}

export async function getSteamUsername(steamId: string) {
  const params = {
    key: process.env.STEAM_API_KEY,
    steamids: steamId,
  }

  const { data } = await axios.get(usernameURL, {
    params,
  })

  if (data.response) {
    return data.response.players[0].personaname
  }

  return null
}

function removeSteamUrl(steamId: string) {
  return steamId
    .replace('https://steamcommunity.com/profiles/', '')
    .replace('https://steamcommunity.com/id/', '')
    .replace('https://csgostats.gg/player/', '')
    .replace('/', '')
}

async function resolveSteam(steamIdInput: string): Promise<SteamID> {
  try {
    const sid = new SteamID(steamIdInput)

    if (!sid.isValid()) {
      throw new Error('not valid sid')
    }
    return sid
  } catch (err) {
    const vanity = await getVanity(steamIdInput)

    if (vanity) {
      return new SteamID(vanity)
    }
    return null
  }
}

export async function getSteam(steamId: string): Promise<SteamID> {
  const steamIdWithoutUrl = removeSteamUrl(steamId)
  const steamAcct = await resolveSteam(steamIdWithoutUrl)
  if (!steamAcct) {
      return null
  }
  return steamAcct
}

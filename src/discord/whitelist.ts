import * as Discord from 'discord.js'

import { addWhitelist, Whitelist } from './utils/db'
import { getSteam, getSteamProfile, getSteamMDLink } from './utils/steam'
 
export async function processWhitelist(steamUrl: string, reporter: string): Promise<string> {
  const steam = await getSteam(steamUrl)
  if (!steam) {
    return 'Error: Could not get steam id from input'
  }
  const steamId = steam.getSteamID64()
  if (!steamId) {
    return 'Error: could not resolve steam id'
  }
  const profile = await getSteamProfile(steamId).catch(() => null)
  const username = profile ? profile.personaname : 'this user'

  const whitelistInfo: Whitelist = {
    date: Date.now(),
    reporter,
    steamId,
  }

  const player = await addWhitelist(steamId, whitelistInfo)

  if (!player) {
    return 'error adding player to whitelist'
  }

  return `${getSteamMDLink(username, steamId)} has been added to the whitelist.`
}

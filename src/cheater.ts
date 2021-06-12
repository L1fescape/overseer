import * as Discord from 'discord.js'

import { addCheater } from './utils/db'
import { getSteam, getSteamProfile, getSteamMDLink } from './utils/steam'
import { reportCountToString, reportsToString } from './utils/reports'
 
export async function processCheater(steamUrl: string, reporter: string): Promise<string> {
  const steam = await getSteam(steamUrl)
  if (!steam) {
    return 'Error: Could not get steam id from input'
  }
  const steamId = steam.getSteamID64()
  if (!steamId) {
    return 'Error: could not resolve steam id'
  }
  const profile = await getSteamProfile(steamId).catch(() => null)
  const username = profile ? profile.personaname : null

  const report = {
    date: Date.now(),
    reporter,
    username,
  }

  const cheater = await addCheater(steamId, {
    steamId,
    reports: [report]
  })
  if (!cheater) {
    return 'Error adding cheater'
  }
  const cheaterName = username || steamId

  if (cheater.reports.length > 1) {
    return `Report added. ${getSteamMDLink(cheaterName, steamId)} has been reported ${reportCountToString(cheater.reports)}:\n${reportsToString(cheater.reports)}`
  }
  return `${getSteamMDLink(cheaterName, steamId)} has been added to the list of cheaters.`
}

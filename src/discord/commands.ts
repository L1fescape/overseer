import { addCheater, addWhitelist, Whitelist } from '../utils/db'
import { getSteam, getSteamProfile, getSteamMDLink } from '../utils/steam'
import { reportCountToString, reportsToString } from '../utils/reports'

const COMMAND_PREFIX = process.env.DISCORD_COMMAND_PREFIX

export const enum COMMANDS {
  Report = 'report',
  Check = 'check',
  Whitelist = 'whitelist',
}

export const enum ARGS {
  SteamURL = 'steam_url',
}

export const slashCommands = [{
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
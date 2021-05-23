import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'

import { getSteam, getSteamUsername } from './steam'
import { getCheater, addCheater, Report } from './db'

dayjs.extend(relativeTime)

function reportsToString(reports: Report[]): string {
  reports.sort((a, b) => b.date - a.date)
  return reports.reduce((acc, report) => {
    return `${acc}- ${dayjs(report.date).fromNow()} by ${report.reporter}\n`
  }, "")
}

function reportCountToString(reports: Report[]): string {
  return `${reports.length} time${reports.length === 1 ? '' : 's'}`
}

function getSteamLink(username: string, steamId: string): string {
  return `[${username}](https://steamcommunity.com/profiles/${steamId})`
}

export async function checkCheater(steamUrl: string): Promise<string> {
  const steam = await getSteam(steamUrl)
  if (!steam) {
    return 'error getting steam id from url'
  }

  const steamId = steam.getSteamID64()
  if (!steamId) {
    return `Error: could not lookup steam id ${steamId} on steam`
  }
  const cheater = await getCheater(steamId)
  if (!cheater) {
    return `${getSteamLink('This user', steamId)} has not been reported yet`
  }
  const username = await getSteamUsername(steamId).catch(() => 'this user')

  return `${getSteamLink(username, steamId)} has been reported ${reportCountToString(cheater.reports)}:\n${reportsToString(cheater.reports)}`
}

export async function processCheater(steamUrl: string, reporter: string, matchUrl?: string): Promise<string> {
  const steam = await getSteam(steamUrl)
  if (!steam) {
    return 'Error: Could not get steam id from input'
  }
  const steamId = steam.getSteamID64()
  if (!steamId) {
    return 'Error: could not resolve steam id'
  }
  const username = await getSteamUsername(steamId).catch(() => null)

  const report = {
    matchUrl,
    date: Date.now(),
    reporter,
    username,
  }

  const cheater = await addCheater(steamId, {
    steamId,
    reports: [report]
  })
  if (!cheater) {
    return 'error adding cheater'
  }
  const cheaterName = username || steamId
  if (cheater.reports.length > 1) {
    return `Report added. ${getSteamLink(cheaterName, steamId)} has been reported ${reportCountToString(cheater.reports)}:\n${reportsToString(cheater.reports)}`
  }
  return `${getSteamLink(cheaterName, steamId)} has been added to the list of cheaters.`

}
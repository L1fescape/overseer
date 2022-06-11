import * as SteamID from 'steamid'

import { SteamProfile, getSteam, getSteamProfile, getSteamMDLink } from './services/steam'
import { CSGOStats, getCSGOStats } from '@/services/csgostats'
import { Cheater, getCheater, getWhitelist } from '@/utils/db'
import { reportCountToString } from '@/utils/reports'
import { getCSGOStatsMDLink, getRankFromNum } from '@/utils/ranks'
import { getFaceit, FaceitStats } from '@/services/faceit'

export const STATUS_PREFIX = '# userid name uniqueid'
export const CHECK_PREFIX = '!check'

const asyncGetPlayer = async (id: string) => await getSteam(id)
const asyncGetWhitelist = async (id: string) => await getWhitelist(id)
const asyncGetPlayerInfo = async (steam: SteamID) => await getPlayerInfo(steam)

export interface PlayerInfo {
  steamId: string
  profile: SteamProfile
  csgoStats: CSGOStats
  faceitStats?: FaceitStats
  cheater: Cheater
}

export function playerInfoToString({ steamId, profile, csgoStats, cheater }: PlayerInfo): string {
  let str = `Steam: ${getSteamMDLink(profile.personaname, steamId)}
CSGO Stats: ${getCSGOStatsMDLink(steamId)}
**K/D**: ${csgoStats.kda} | **HLTV**: ${csgoStats.hltvRating} | **Rank**: ${getRankFromNum(csgoStats.rankNum)}`
  if (cheater) {
    str += `\n**WARNING**: this player is cheating and been reported ${reportCountToString(cheater.reports)}`
  }
  return str
}

export async function processCheck(input: string): Promise<PlayerInfo[]> {
  const playerIds: string[] = []
  const lines = input.split('\n')
  lines.forEach(line => {
    const start = line.indexOf('STEAM_1')
    if (start === -1) {
      return
    }
    const id = line.substring(start).split(' ')[0]
    playerIds.push(id)
  })

  const players: SteamID[] = await Promise.all(playerIds.map(id => asyncGetPlayer(id)))
  const whitelistedPlayers = (await Promise.all(players.map(player => asyncGetWhitelist(player.getSteamID64()))))
    .filter(player => Boolean(player))
    .map(whitelist => whitelist.steamId)

  const filteredPlayers = players.filter(player => whitelistedPlayers.indexOf(player.getSteamID64()) === -1)

  return await Promise.all(filteredPlayers.map(player => asyncGetPlayerInfo(player)))
}

async function getPlayerInfo(steam: SteamID): Promise<PlayerInfo> {
  const steamId = steam.getSteamID64()
  if (!steamId) {
    console.log(`Error: could not lookup steam id ${steamId} on steam`)
    return null
  }
  const profile = await getSteamProfile(steamId).catch(() => null)
  const csgoStats = await getCSGOStats(steamId)
  const faceitStats = await getFaceit(steamId)
  const cheater = await getCheater(steamId)

  return {
    steamId,
    profile,
    csgoStats,
    faceitStats,
    cheater,
  }
}

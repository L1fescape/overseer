import * as Discord from 'discord.js'

import { PlayerInfo } from '../check'
import { getSteamLink } from '../utils/steam'
import { reportCountToString, reportersToString } from '../utils/reports'
import { getRankFromNum, getColorFromRankNum, getCSGOStatsMDLink, colors } from '../utils/ranks'


const defaultAvatar = 'https://community.cloudflare.steamstatic.com/public/shared/images/responsive/share_steam_logo.png'


export function getEmbed({ steamId, profile, csgoStats, cheater, faceitStats }: PlayerInfo) {
  const username = profile ? profile.personaname : steamId
  const color = cheater ? colors.red : getColorFromRankNum(csgoStats.rankNum)

  const playerEmbed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(username)
    .setURL(getSteamLink(steamId))
    .setThumbnail(profile ? profile.avatar : defaultAvatar)
    .addFields(
      { name: 'CSGO Stats', value: getCSGOStatsMDLink(steamId) },
      { name: 'Rank', value: getRankFromNum(csgoStats.rankNum) || 'No Rank', inline: true },
      { name: 'K/D', value: csgoStats.kda || 'N/A', inline: true },
      { name: 'Games', value: csgoStats.matches || 'N/A', inline: true },
    )

  if (faceitStats) {
    playerEmbed
      .addFields(
        { name: 'Faceit', value: `[${faceitStats.link}](${faceitStats.link})` },
        { name: 'Rank', value: faceitStats.rank, inline: true },
        { name: 'K/D', value: faceitStats.kd, inline: true },
        { name: 'Games', value: faceitStats.matches, inline: true },
      )
  }
  
  if (cheater) {
    playerEmbed.addField('WARNING: Player has previously been reported as a cheater', `Has been reported ${reportCountToString(cheater.reports)} by ${reportersToString(cheater.reports)}`)
  }

  return playerEmbed
}
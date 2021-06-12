import * as Discord from 'discord.js'

import { PlayerInfo } from './check'
import { getSteamLink } from './utils/steam'
import { reportCountToString } from './utils/reports'
import { getRankFromNum, getColorFromRankNum, getCSGOStatsMDLink, colors } from './utils/ranks'


const defaultAvatar = 'https://community.cloudflare.steamstatic.com/public/shared/images/responsive/share_steam_logo.png'


export function getEmbed({ steamId, profile, csgoStats, cheater }: PlayerInfo) {
  const username = profile ? profile.personaname : steamId
  const color = cheater ? colors.red : getColorFromRankNum(csgoStats.rankNum)

  const playerEmbed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(username)
    .setURL(getSteamLink(steamId))
    .setThumbnail(profile ? profile.avatar : defaultAvatar)
    .addFields(
      { name: 'Stats', value: getCSGOStatsMDLink(steamId) },
      { name: 'K/D', value: csgoStats.kda, inline: true },
      { name: 'HLTV', value: csgoStats.hltvRating, inline: true },
      { name: 'Rank', value: getRankFromNum(csgoStats.rankNum), inline: true },
    )
  
  if (cheater) {
    playerEmbed.addField('WARNING: Player is cheating', `Has been reported ${reportCountToString(cheater.reports)}`)
  }

  return playerEmbed
}
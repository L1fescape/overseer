export const getCSGOStatsMDLink = (id: string) => `[csgostats.gg/player/${id}](https://csgostats.gg/player/${id})`

const ranks: {[key: string]: string} = {
  1: 'Silver I',
  2: 'Silver II',
  3: 'Silver III',
  4: 'Silver IV',
  5: 'Silver Elite',
  6: 'Silver Elite Master',
  7: 'Gold Nova I',
  8: 'Gold Nova II',
  9: 'Gold Nova III',
  10: 'Gold Nova Master',
  11: 'Master Guardian I',
  12: 'Master Guardian II',
  13: 'Master Guardian Elite',
  14: 'Distinguished Master Guardian',
  15: 'Legendary Eagle',
  16: 'Legendary Eagle Master',
  17: 'Supreme',
  18: 'Global',
}

export const colors = {
  red: '#f04747',
  green: '#43b581',
  grey: '#747f8d',
  blue: '#5865f2',
  gold: '#ffab12',
  black: '#000000',
}

export function getRankFromNum(num: string) {
  return ranks[num] || 'no rank'
}

export const getColorFromRankNum = (num: string) => {
  const numInt = parseInt(num, 10)
  if (numInt <= 6) {
    return colors.grey
  }
  if (numInt <= 10) {
    return colors.gold
  }
  if (numInt <= 13) {
    return colors.green
  }
  if (numInt <= 16) {
    return colors.blue
  }
  return colors.black
}
import * as redis from 'redis'
import { promisify } from 'util'

export interface Report {
  date: number
  username: string
  reporter: string
}

export interface Cheater {
  steamId: string
  reports: Report[]
}

const cheaterDBKey = 'cheater'
function getCheaterKey(steamid: string): string {
  return `${cheaterDBKey}:${steamid}`
}

const client = redis.createClient(process.env.REDIS_URL)
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)
const getKeysAsync = promisify(client.keys).bind(client)

export async function getCheater(steamid: string): Promise<Cheater> {
  const dbCheater = await getAsync(getCheaterKey(steamid))
  if (!dbCheater) {
    return null
  }
  return JSON.parse(dbCheater)
}

async function setCheater(steamid: string, cheater: Cheater): Promise<boolean> {
  const status = await setAsync(getCheaterKey(steamid), JSON.stringify(cheater))
  return status !== 'OK'
}

export async function addCheater(steamid: string, cheater: Cheater): Promise<Cheater> {
  const existingCheater = await getCheater(steamid)
  if (existingCheater) {
    console.log('updating existing cheater', existingCheater)
    cheater.reports = existingCheater.reports.concat(cheater.reports)

    const err = await setCheater(steamid, cheater)
    if (err) {
      console.error('error adding report for cheater', cheater)
      return null
    }

    return cheater
  }

  console.log('adding new cheater', cheater)
  const err = await setCheater(steamid, cheater)
  if (err) {
    console.error('error adding cheater', err)
    return null
  }
  return cheater
}


export interface Whitelist {
  steamId: string
  date: number
  reporter: string
}

const whitelistDBKey = 'whitelist'
function getWhitelistKey(steamid: string): string {
  return `${whitelistDBKey}:${steamid}`
}

export async function getWhitelist(steamid: string): Promise<Whitelist> {
  const dbWhitelist = await getAsync(getWhitelistKey(steamid))
  if (!dbWhitelist) {
    return null
  }
  return JSON.parse(dbWhitelist)
}

async function setWhitelist(steamid: string, player: Whitelist): Promise<boolean> {
  const status = await setAsync(getWhitelistKey(steamid), JSON.stringify(player))
  return status !== 'OK'
}

export async function addWhitelist(steamid: string, whitelistedPlayer: Whitelist): Promise<Whitelist> {
  const existingPlayer = await getWhitelist(steamid)

  if (!existingPlayer) {
    console.log('adding whitelisted player', steamid)
    const err = await setWhitelist(steamid, whitelistedPlayer)
    if (err) {
      console.error('error adding whitelist', err)
      return null
    }
  }

  return whitelistedPlayer
}

export interface ExportData {
  cheaters: Cheater[]
  whitelist: Whitelist[]
}

async function getAll(key: string) {
  const keys = await getKeysAsync(`${key}:*`)
  const getMapFn = async (key: string) => {
    const val = await getAsync(key)
    return JSON.parse(val)
  }
  return await Promise.all(keys.map((key: string) => getMapFn(key)))
}

export async function exportDB(): Promise<ExportData> {
  const cheaters = await getAll(cheaterDBKey) as Cheater[]
  const whitelist = await getAll(whitelistDBKey) as Whitelist[]

  return {
    cheaters,
    whitelist,
  }
}

async function setAll(key: string, data: Cheater[] | Whitelist[]) {
  const setMapFn = async (item: Cheater | Whitelist) => {
    if (key === whitelistDBKey) {
      await setWhitelist(item.steamId, item as Whitelist)
    } else if (key === cheaterDBKey) {
      await setCheater(item.steamId, item as Cheater)
    }
  }
  return await Promise.all(data.map((item: Cheater | Whitelist) => setMapFn(item)))
}

export async function importDB(data: ExportData) {
  await setAll(cheaterDBKey, data.cheaters)
  await setAll(whitelistDBKey, data.whitelist)
}
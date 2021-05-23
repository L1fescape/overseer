import * as redis from 'redis'
import { promisify } from 'util'

export interface Report {
  matchUrl?: string
  date: number
  username: string
  reporter: string
}

export interface Cheater {
  steamId: string
  reports: Report[]
}

const dbKey = 'cheater'
function getKey(steamid: string): string {
  return `${dbKey}:${steamid}`
}

const client = redis.createClient(process.env.REDIS_URL)
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

export async function getCheater(steamid: string): Promise<Cheater> {
  const dbCheater = await getAsync(getKey(steamid))
  if (!dbCheater) {
    console.log('could not find cheater', steamid)
    return null
  }
  return JSON.parse(dbCheater)
}

async function setCheater(steamid: string, cheater: Cheater): Promise<boolean> {
  const status = await setAsync(getKey(steamid), JSON.stringify(cheater))
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
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer-extra'
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export interface CSGOStats {
  url: string
  rankNum: string
}

function getRankFromElo(elo: number): number {
  if (elo <= 800) return 1
  if (elo <= 950) return 2
  if (elo <= 1100) return 3
  if (elo <= 1250) return 4
  if (elo <= 1400) return 5
  if (elo <= 1550) return 6
  if (elo <= 1700) return 7
  if (elo <= 1850) return 8
  if (elo <= 2000) return 9
  if (elo > 2000) return 10
  return 0
}

export interface FaceitStats {
  link: string
  elo: number
  rank: number
  hsPercent: string
  matches: number
  kd: string
}

export async function getFaceit(steamId64: string): Promise<FaceitStats> {
  const url = `https://faceitfinder.com/profile/${steamId64}`
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  let html = ''

  try { 
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(true)
    await page.goto(url)
    html = await page.content()
  } catch (e) {
    console.error('puppeteer faceit error', e)
  } finally {
    await browser.close()
  }

  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
  })

  const accountLink = $('.account-faceit-title a').attr('href')
  if (!accountLink) {
    return null
  }

  const stats = {
    link: accountLink,
    elo: 0,
    rank: 0,
    hsPercent: '0%',
    matches: 0,
    kd: '0',
  }

  const statsDivs = $('.account-faceit-stats-single')
  statsDivs.each((_, elem) => {
    const text = $(elem).text() 
    if (text.indexOf('ELO') > -1) {
      stats.elo = parseInt(text.replace('ELO: ', ''), 10)
    }
    if (text.indexOf('Matches') > -1) {
      stats.matches = parseInt(text.replace('Matches: ', ''), 10)
    }
    if (text.indexOf('K/D') > -1) {
      stats.kd = text.replace('K/D: ', '')
    }
    if (text.indexOf('HS: ') > -1) {
      stats.hsPercent = text.replace('HS: ', '')
    }
  })
  stats.rank = getRankFromElo(stats.elo)

  return stats
}
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer-extra'
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export interface CSGOStats {
  kda: string
  hltvRating: string
  url: string
  rankNum: string
}

export async function getCSGOStats(steamId64: string): Promise<CSGOStats> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  await page.setJavaScriptEnabled(true)

  const url = `https://csgostats.gg/player/${steamId64}`
  await page.goto(url)

  const html = await page.content()
  await browser.close()

  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
  })

  const kda = $('#kpd > span').text().trim()
  const hltvRating = $('#rating > span').text().trim()
  const rankSrc = $('img[src*="ranks"]').attr('src')
  let rankNum = ''
  if (rankSrc) {
    rankNum = rankSrc.substring(rankSrc.indexOf('/ranks/') + 7).replace('.png', '')
  }

  if (process.env.DEBUG) {
    console.log(kda, hltvRating, url, rankNum)
  }

  return {
    kda,
    hltvRating,
    url,
    rankNum,
  }
}
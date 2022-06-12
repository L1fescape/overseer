import * as cheerio from 'cheerio'

import { getPuppeteerBrowser } from '../utils/puppeteer'

export interface CSGOStats {
  kda: string
  hltvRating: string
  url: string
  rankNum: string
  matches: string
}

export async function getCSGOStats(steamId64: string): Promise<CSGOStats> {
  const url = `https://csgostats.gg/player/${steamId64}`
  const browser = await getPuppeteerBrowser()
  let html = ''

  try { 
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(true)
    await page.goto(url)
    html = await page.content()
  } catch (e) {
    console.error('puppeteer csgostats error', e)
  } finally {
    await browser.close()
  }

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
  const matches = $('#competitve-wins').text().trim().replace('Comp. Wins', '')

  return {
    kda,
    hltvRating,
    url,
    rankNum,
    matches,
  }
}
import puppeteer from 'puppeteer-extra'
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

export async function getPuppeteerBrowser() {
  return await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}
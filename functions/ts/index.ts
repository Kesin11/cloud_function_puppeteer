import * as functions from 'firebase-functions';
import puppeteer from 'puppeteer'

export const launchPuppeteer = functions
  .runWith({ timeoutSeconds: 120, memory: '512MB'})
  .https.onRequest(async (request, response) => {
    // 外部から制御できるようにchromeを起動する

    const isDebug = process.env.NODE_ENV !== 'production'
    const browser = await puppeteer.launch({
      headless: isDebug ? false : true,
      args: ['--no-sandbox', '--remote-debugging-port=9222']
    })
    const browserWSEndpoint = browser.wsEndpoint()
    console.log(browserWSEndpoint)
})

import * as functions from 'firebase-functions';
import puppeteer from 'puppeteer'
import { LocalDebugRelay } from './relay/local_debug';

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

export const relay_exp = functions
  .runWith({ timeoutSeconds: 120, memory: '512MB'})
  .https.onRequest(async (request, response) => {
    const isDebug = process.env.NODE_ENV !== 'production'
    const remoteBrowser = await puppeteer.launch({
      headless: isDebug ? false : true,
      args: ['--no-sandbox', '--remote-debugging-port=9222']
    })
    const browserWSEndpoint = remoteBrowser.wsEndpoint()

    const relay = await LocalDebugRelay.start({relayTo: browserWSEndpoint, port: 8080})

    const clientBrowser = await puppeteer.connect({ browserWSEndpoint: relay.endpoint })

    const page = await clientBrowser.newPage()
    await page.goto('https://www.google.com/')

    console.log('---------------')
    console.log(page.url())
    console.log('---------------')
})

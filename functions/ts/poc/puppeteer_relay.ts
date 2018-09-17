import puppeteer from 'puppeteer'
import { LocalRelay } from "../relay/local";
import { RemoteRelay } from '../relay/remote';

const main = async() => {
  // remote puppeteer
  const isDebug = process.env.NODE_ENV !== 'production'
  const remoteBrowser = await puppeteer.launch({
    headless: isDebug ? false : true,
    args: ['--no-sandbox', '--remote-debugging-port=9222']
  })
  const browserWSEndpoint = remoteBrowser.wsEndpoint()

  // remote relay
  console.log('[index] RemoteRelay.start')
  const remoteRelay = await RemoteRelay.start({relayUrl: browserWSEndpoint})

  // local relay
  console.log('[index] LocalRelay.start')
  const localRelay = await LocalRelay.start({port: 8080})

  // local puppeteer
  console.log('[index] puppeteer.connect')
  const clientBrowser = await puppeteer.connect({ browserWSEndpoint: localRelay.endpoint })

  const page = await clientBrowser.newPage()
  await page.goto('https://www.google.com/')

  console.log('---------------')
  console.log(page.url())
  console.log('---------------')
}
main()
import puppeteer from 'puppeteer'
import { RemoteRelayWebsocket } from '../relay/remote';

const main = async() => {
  // remote puppeteer
  const isDebug = process.env.NODE_ENV !== 'production'
  const remoteBrowser = await puppeteer.launch({
    headless: isDebug ? false : true,
    // slowMo: 5000,
    args: ['--no-sandbox', '--remote-debugging-port=9222']
  })
  const browserWSEndpoint = remoteBrowser.wsEndpoint()

  // remote relay
  console.log('[index] RemoteRelay.start')
  const remoteRelay = await RemoteRelayWebsocket.start({relayUrl: browserWSEndpoint, localServerUrl: 'ws://localhost:8081'})
}
main()
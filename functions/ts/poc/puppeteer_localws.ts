import puppeteer from 'puppeteer'
import { WebsocketRelayServer } from '../websocket/server'
import { WebsocketRelayClient } from '../websocket/client';
import { LocalDebugRelay } from '../relay/local_debug';

const puppeteer_to_localserver = async() => {
  const server = WebsocketRelayServer.start({port: 8080})

  const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:8080' })
}

const localclient_to_puppeteer = async() => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--remote-debugging-port=9222']
  })
  const browserWSEndpoint = browser.wsEndpoint()
  console.log({browserWSEndpoint})

  const client = await WebsocketRelayClient.connect(browserWSEndpoint)
  client.send('foo')
}

const puppeteer_relay = async() => {
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
}

// puppeteer_to_localserver()
// localclient_to_puppeteer()
puppeteer_relay()

// TODO: serverとclientを内包したRelayというのを作って、puppetterの通信を仲介させてみる
import puppeteer from 'puppeteer'
import { RelayServer } from '../websocket/server'
import { RelayClient } from '../websocket/client';

const puppeteer_to_localserver = async() => {
  const server = await RelayServer.start()

  const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:8080' })
}

const localclient_to_puppeteer = async() => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--remote-debugging-port=9222']
  })
  const browserWSEndpoint = browser.wsEndpoint()
  console.log({browserWSEndpoint})

  const client = await RelayClient.connect(browserWSEndpoint)
  client.send('foo')
}

// puppeteer_to_localserver()
localclient_to_puppeteer()
import * as functions from 'firebase-functions';
import puppeteer from 'puppeteer'
import { RelayClient } from './websocket/client'
import { RelayServer } from './websocket/server'

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
  .https.onRequest(async (request, response) => {
    const server = await RelayServer.start()

    const client = await RelayClient.connect('ws://localhost:8080/', 'echo-protocol')
    client.send('send message')
})

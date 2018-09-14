import puppeteer from 'puppeteer'
import { RelayServer } from '../websocket/server'

const puppeteer_to_localserver = async() => {
  const server = await RelayServer.start()

  const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:8080' })
}
puppeteer_to_localserver()
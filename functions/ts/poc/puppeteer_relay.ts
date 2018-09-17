import puppeteer from 'puppeteer'
import { LocalRelay } from "../relay/local";
import PubSub from '@google-cloud/pubsub'

const main = async() => {
  const localRelay = await LocalRelay.start({port: 8080})

  const clientBrowser = await puppeteer.connect({ browserWSEndpoint: localRelay.endpoint })

  const page = await clientBrowser.newPage()
  await page.goto('https://www.google.com/')

  console.log('---------------')
  console.log(page.url())
  console.log('---------------')
}
main()
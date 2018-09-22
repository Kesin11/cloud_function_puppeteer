import puppeteer from 'puppeteer'
import { LocalRelay } from "../relay/local";
import { RemoteRelay } from '../relay/remote';

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
  const remoteRelay = await RemoteRelay.start({relayUrl: browserWSEndpoint})

  // local relay
  console.log('[index] LocalRelay.start')
  const localRelay = await LocalRelay.start({port: 8080})

  // local puppeteer
  console.log('[index] puppeteer.connect')
  const clientBrowser = await puppeteer.connect({ browserWSEndpoint: localRelay.endpoint })

  const pages = await clientBrowser.pages()
  const page = pages[0]
  await page.goto('http://www.example.com/')
  const title = await page.$eval('h1', (el: any) => el.innerText)
  console.log(`[index] title: ${title}`)

  // await page.goto('https://www.google.com/', {waitUntil: 'networkidle0'})
  await page.goto('https://www.google.com/', { waitUntil: "domcontentloaded"})
  await page.type("#lst-ib", "test")
  await page.$eval('#tsf', (el: any) => el.submit())
  console.log('[index] page.eval')
  const urls = await page.$$eval('h3.r > a', (elList: any) => {
    return elList.map((el) => el.href)
  })
  await page.goto('https://cloud.google.com/')
  console.log('---------------')
  console.log(urls)
  console.log('---------------')

  console.log('[index] page close')
  await page.close()
  console.log('[index] browser close')
  await clientBrowser.close()
}
main()
import puppeteer from 'puppeteer'
import { LocalRelayPubsub } from "../relay/local";

const main = async() => {
  // local relay
  console.log('[index] LocalRelay.start')
  const localRelay = await LocalRelayPubsub.start({port: 8080})

  // local puppeteer
  console.log('[index] puppeteer.connect')
  const clientBrowser = await puppeteer.connect({ browserWSEndpoint: localRelay.endpoint })

  const page = await clientBrowser.newPage()
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
}
main()
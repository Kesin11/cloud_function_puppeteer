import puppeteer from 'puppeteer'
import { LocalRelayWebsocket } from "../relay/local";

const main = async() => {
  // local relay
  console.log('[index] LocalRelay.start')
  const localRelay = await LocalRelayWebsocket.start({serverPort: 8080, clientPort: 8081})

  // wait for connect remote to local
  console.log('[index] await LocalRelay ready')
  await localRelay.ready

  // local puppeteer
  console.log('[index] puppeteer.connect')
  const clientBrowser = await puppeteer.connect({ browserWSEndpoint: localRelay.serverEndpoint  })

  const pages = await clientBrowser.pages()
  const page = pages[0]
  await page.goto('http://www.example.com/')
  const title = await page.$eval('h1', (el: any) => el.innerText)
  console.log(`[index] title: ${title}`)

  // await page.goto('https://www.google.com/', {waitUntil: 'networkidle0'})
  console.log('[index] goto 1')
  await page.goto('https://www.google.com/', { waitUntil: "domcontentloaded"})
  await page.type("#lst-ib", "test")
  console.log('[index] page.$eval')
  await page.$eval('#tsf', (el: any) => el.submit())
  console.log('[index] page.$$eval')
  const urls = await page.$$eval('h3.r > a', (elList: any) => {
    return elList.map((el) => el.href)
  })
  console.log('---------------')
  console.log(urls)
  console.log('---------------')

  console.log('[index] goto 2')
  await page.goto('https://cloud.google.com/')

  console.log('[index] page close')
  await page.close()
  // console.log('[index] browser close')
  // await clientBrowser.close()
}
main()
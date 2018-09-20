import puppeteer from 'puppeteer'
import { LocalRelay } from "../relay/local";
import { RemoteRelay } from '../relay/remote';

const main = async() => {
  // remote puppeteer
  const isDebug = process.env.NODE_ENV !== 'production'
  const remoteBrowser = await puppeteer.launch({
    headless: isDebug ? false : true,
    slowMo: 5000,
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
  await page.goto('http://www.example.com/')
  const title = await page.$eval('h1', (el: any) => el.innerText)
  console.log(`[index] title: ${title}`)

  // await page.goto('https://www.google.com/', {waitUntil: 'networkidle0'})
  await page.goto('https://www.google.com/', { waitUntil: "domcontentloaded"})
  console.log(page.url())
  await page.type("#lst-ib", "test")
  await page.$eval('#tsf', (el: any) => el.submit())
  console.log('[index] waitForNavigation')
  await page.waitForNavigation()
  console.log('[index] page.eval')
  const urls = await page.$$eval('h3.r > a', (elList: any) => {
    return elList.map((el) => el.href)
  })
  await page.goto('http://www.example.com/')
  console.log('---------------')
  console.log(urls)
  console.log('---------------')

  // TODO:
  // もしかするとpubsubで同じメッセージが2回送られている？
  // とりあえずhashで同じmessage.idが2回来ていないかを見てみる
  // 雑な対策としてはif messageId > lastMessageIdだけど、多少順番が崩れる可能性もあるので実際にはもっと真面目に対策した方がいい
  // last 100ぐらいを保存するhashにすればメモリ的にも問題なさそう？
}
main()
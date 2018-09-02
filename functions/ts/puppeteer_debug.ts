import puppeteer from 'puppeteer'

const main = async () => {
  const endpoint = process.argv[2]
  console.log(`attach: ${endpoint}`)

  // 起動したchromeにアタッチする
  const browser = await puppeteer.connect({ browserWSEndpoint: endpoint })
  const page = await browser.newPage()
  await page.goto('https://www.google.com/', { waitUntil: "domcontentloaded"})
  console.log(page.url())
  await page.type("#lst-ib", "test")
  await page.$eval('#tsf', (el: any) => el.submit())
  await page.waitForNavigation()
  console.log(page.url())
}
main()

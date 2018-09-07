// export class RemotePuppeteer {
//   async launch() {

//   }
  
//   async newPage() {
//     // 実際にブラウザを立ち上げることなく、proxyするためのpageと同じメソッドを持つオブジェクトを返す必要がある
//     // sinon.createStubInstanceというものがあるのでこれが参考になりそう？
//   }
// }

import puppeteer from 'puppeteer'

const main = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // getPrototypeOfでクラスをゲットして、空のオブジェクトを作る
  const props = Object.create(Object.getPrototypeOf(page))
  console.log(page === props)

  // 本物が動くことを確認
  await page.goto('http://www.google.com')
  console.log(page.url())

  // Proxy用
  const handler = {
    get(target: any, property: any, _receiver: any) {
      console.log('hook get')
      return async function(this: any, ...args: any[]) {
        return console.log(property, args)
      }
    }
  }
  const proxy = new Proxy(page, handler)

  // proxyでpageと同じメソッドが存在していて、呼び出したときにhookできることを確認
  await proxy.goto('http://example.com')
  await proxy.$eval('#element', (el:any) => { el.click() })
  console.log(proxy.url())

  // functionはJSON化できないのが、文字列になら変換できる。evalとかはこうするしかないか
  const fn = (foo: any) => console.log(foo)
  console.log(fn.toString())

  browser.close()
}
main()
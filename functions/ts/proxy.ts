// 適当なクラス
class Page {
  public url: string
  constructor() {
    this.url = ''
  }
  goto(url: string) {
    this.url = url
  }
}

const handler = {
  get(target: any, property: any, _receiver: any) {
    console.log('hook get')
    console.log(target, property)

    // getterもmethod呼び出しも全てhookされる
    // this: anyはTypeScriptの構文でthisに型を付けるだけ
    const origMethod = target[property]
    return function(this: any, ...args: any[]) {
      console.log(origMethod, args)
      return origMethod.apply(this, args)
    }
  }
}

const page = new Page()
const p = new Proxy(page, handler)

// proxyに対してのメソッド呼び出しは全てhandlerを通るのでhookできる
p.goto('http://www.example.com')
const url = p.url

// オリジナルのpageの方も値がちゃんと更新される
console.log('original: ', page.url)
console.log('proxy: ', p.url)
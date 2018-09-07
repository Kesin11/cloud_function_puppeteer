import { Dispatcher } from './dispatcher'
import puppeteer from 'puppeteer'

class RemoteFoo {
  dispatcher: Dispatcher
  url: string
  constructor(dispatcher: Dispatcher) {
    this.url = ''
    this.dispatcher = dispatcher
    dispatcher.on(async (property: string, args: any[]) => {
      const origMethod = (this as any)[property]
      return origMethod.apply(this, args)
    })
  }
  goto(url: string, suffix: string) {
    this.url = url + suffix + 'hogehogehoge'
  }
}

class Foo {
  public url: string
  constructor() {
    this.url = ''
  }
  goto(url: string, suffix: string) {
    this.url = url + suffix
  }
}

const createLocalPage = (dispatcher: Dispatcher) => {
  const handler = {
    get(target: any, property: any, _receiver: any) {
      console.log('hook get')
      return async function(this: any, ...args: any[]) {
        return await dispatcher.dispatch(property, args)
      }
    }
  }

  const page = new Foo()
  return new Proxy(page, handler)
}

const dispatcher = new Dispatcher()
const remotePage = new RemoteFoo(dispatcher)
const localPage = createLocalPage(dispatcher)
localPage.goto('http://www.example.com', '/suffix/')

console.log(localPage.url)
console.log(remotePage.url)
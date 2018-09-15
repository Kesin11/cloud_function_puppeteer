import { RelayServer } from "./server";
import { RelayClient } from "./client";

export class Relay {
  relayTo: string
  endpoint: string
  server: RelayServer
  client: RelayClient

  constructor({relayTo, port, server, client}:
    {relayTo: string, port: number, server: RelayServer, client: RelayClient}) {
    this.relayTo = relayTo
    this.endpoint = `ws://localhost:${port}`
    this.server = server
    this.client = client
  }

  static async start({relayTo, port}: {relayTo: string, port: number}) {
    const server = RelayServer.start({port})
    const client = await RelayClient.connect(relayTo)

    // serverにmessageが送られてきたらclientにそのまま流す
    // clientへの返信はそのままserverから返す
    // puppeteer.connectはsendでbrowserContextIdを取ろうとしているらしい

    // TODO: client.sendでpuppeteerに同じ内容を送っているはずだけど、なぜかConnection Closedになる？

    await server.setOnMessage((message: any) => {
      console.log('[Relay] callback onMessage')
      if (message.type === 'utf8') {
        client.send(message)
      }
    })

    const instance = new Relay({relayTo, port, server, client})
    return instance
  }
}
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
    server.setOnMessage((serverMessage: any, serverConnection: any) => {
      console.log('[Relay] callback server.onMessage')
      // serverで受け付けたmessageをclientの接続先にrelayする
      if (serverMessage.type === 'utf8') {
        client.send(serverMessage)
      }

      // clientの接続先からの返信をserverの接続元にrelayする
      client.setOnMessage((clientMessage: any) => {
        console.log('[Relay] callback client.onMessage')
        serverConnection.sendUTF(clientMessage.utf8Data)
      })
    })

    const instance = new Relay({relayTo, port, server, client})
    return instance
  }
}
import { RelayServer } from "../websocket/server";
import { RelayClient } from "../websocket/client";

export interface Relay {
  server: Server
  client: Client
  endpoint: string
}

export interface Server {
  endpoint: string
  setOnMessage: (callback: () => void) => void
}

export interface Client {
  setOnMessage: (callback: () => void) => void
}

export class LocalDebugRelay implements Relay {
  server: RelayServer
  client: RelayClient

  constructor({server, client}:
    {relayTo: string, port: number, server: RelayServer, client: RelayClient}) {
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

    const instance = new LocalDebugRelay({relayTo, port, server, client})
    return instance
  }

  get endpoint() {
    return this.server.endpoint
  }
}
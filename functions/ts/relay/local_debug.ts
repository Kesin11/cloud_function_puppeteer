import { Relay } from "./relay";
import { WebsocketRelayServer } from "../websocket/server";
import { WebsocketRelayClient } from "../websocket/client";
import { IMessage, connection } from "websocket";

export class LocalDebugRelay implements Relay {
  server: WebsocketRelayServer
  client: WebsocketRelayClient

  constructor({server, client}:
    {relayTo: string, port: number, server: WebsocketRelayServer, client: WebsocketRelayClient}) {
    this.server = server
    this.client = client
  }

  static async start({relayTo, port}: {relayTo: string, port: number}) {
    const server = WebsocketRelayServer.start({port})
    const client = await WebsocketRelayClient.connect(relayTo)

    // serverにmessageが送られてきたらclientにそのまま流す
    // clientへの返信はそのままserverから返す
    // puppeteer.connectはsendでbrowserContextIdを取ろうとしているらしい
    server.setOnMessage((serverMessage: IMessage, serverConnection: connection) => {
      console.log('[Relay] callback server.onMessage')
      // serverで受け付けたmessageをclientの接続先にrelayする
      if (serverMessage.type === 'utf8') {
        client.send(serverMessage)
      }

      // clientの接続先からの返信をserverの接続元にrelayする
      client.setOnMessage((clientMessage: IMessage) => {
        console.log('[Relay] callback client.onMessage')
        if (clientMessage.utf8Data) serverConnection.sendUTF(clientMessage.utf8Data)
      })
    })

    const instance = new LocalDebugRelay({relayTo, port, server, client})
    return instance
  }

  get endpoint() {
    return this.server.endpoint
  }
}
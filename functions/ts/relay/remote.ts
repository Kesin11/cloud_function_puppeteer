import { Relay } from "./relay";
import { CloudPubSub, Event } from "../pubsub";
import { IMessage, connection } from "websocket";
import { WebsocketRelayClient } from "../websocket/client";

// in: PubSub
// out: WebSocket
export class RemoteRelay implements Relay {
  server: CloudPubSub
  client: WebsocketRelayClient

  constructor({server, client}:
    {server: CloudPubSub, client: WebsocketRelayClient}) {
    this.server = server
    this.client = client
  }

  static async start({relayUrl}: {relayUrl: string}) {
    console.log('[RemoteRelay] CloudPubSub.create')
    const server = await CloudPubSub.create({topic: 'remote2local', subscription: 'local2remote_puppeteer'})
    console.log('[RemoteRelay] WebsocketRelayClient.connect')
    const client = await WebsocketRelayClient.connect(relayUrl)

    // pubsub
    server.setOnMessage((serverMessage: Event) => {
      console.log(`[RemoteRelay] callback server.setOnMessage message.id ${serverMessage.id}`)
      client.send(serverMessage.data)

      // websocket
      client.setOnMessage((clientMessage: IMessage, _clientConnection: connection) => {
        console.log('[RemoteRelay] callback client.onMessage')
        if (clientMessage.type === 'utf8' && clientMessage.utf8Data) {
          server.send(clientMessage.utf8Data)
        }
      })
    })

    const instance = new RemoteRelay({server, client})
    return instance
  }
}
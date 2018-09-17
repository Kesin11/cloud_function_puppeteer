import { Relay } from "./relay";
import { WebsocketRelayServer } from "../websocket/server";
import { CloudPubSub, Event } from "../pubsub";
import { IMessage, connection } from "websocket";

// in: WebSocket
// out: PubSub
export class LocalRelay implements Relay {
  server: WebsocketRelayServer
  client: CloudPubSub

  constructor({server, client}:
    {port: number, server: WebsocketRelayServer, client: CloudPubSub}) {
    this.server = server
    this.client = client
  }

  static async start({port}: {port: number}) {
    const server = WebsocketRelayServer.start({port})
    const client = await CloudPubSub.create()

    // websocket
    server.setOnMessage((serverMessage: IMessage, serverConnection: connection) => {
      console.log('[Relay] callback server.onMessage')
      if (serverMessage.type === 'utf8' && serverMessage.utf8Data) {
        client.send(serverMessage.utf8Data)
      }

      // pubsub
      // TODO: clientがsendしているのとhandleしているトピックが同一なので、送ったそばから受け取ってackしてしまっている
      // sendするときと、handleするときのtopicを分ける必要がある
      client.setOnMessage((clientMessage: Event) => {
        console.log('[Relay] callback client.onMessage')
        serverConnection.sendUTF(clientMessage.data)
      })
    })

    const instance = new LocalRelay({port, server, client})
    return instance
  }

  get endpoint() {
    return this.server.endpoint
  }
}
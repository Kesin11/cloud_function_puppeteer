import { Relay } from "./relay";
import { WebsocketRelayServer } from "../websocket/server";
import { CloudPubSub, Event } from "../pubsub";
import { IMessage, connection } from "websocket";

const counter = {}

// in: WebSocket
// out: PubSub
export class LocalRelayPubsub implements Relay {
  server: WebsocketRelayServer
  client: CloudPubSub

  constructor({server, client}:
    {server: WebsocketRelayServer, client: CloudPubSub}) {
    this.server = server
    this.client = client
  }

  static async start({port}: {port: number}) {
    const server = WebsocketRelayServer.start({port})
    const client = await CloudPubSub.create({topic: 'local2remote', subscription: 'remote2local_puppeteer'})

    // websocket
    server.setOnMessage((serverMessage: IMessage, serverConnection: connection) => {
      console.log('[LocalRelay] callback server.onMessage')
      if (serverMessage.type === 'utf8' && serverMessage.utf8Data) {
        client.send(serverMessage.utf8Data)
      }

      // pubsub
      client.setOnMessage((clientMessage: Event) => {
      if (counter[clientMessage.id]) {
        counter[clientMessage.id] += 1
        console.log(`[LocalRelay] WARNING: ${clientMessage.id} called ${counter[clientMessage.id]} times!!!`)
        return
      }
      else {
        counter[clientMessage.id] = 1
      }
        console.log(`[LocalRelay] ---- callback client.onMessage message.id ${clientMessage.id} ----`)
        if (!clientMessage.data) console.error(`[LocalRelay] ERROR!!! clientMessage.data null`)
        serverConnection.sendUTF(clientMessage.data)
      })
    })

    const instance = new LocalRelayPubsub({server, client})
    return instance
  }

  get endpoint() {
    return this.server.endpoint
  }
}

// in: WebSocket server
// out: WebSocket server
export class LocalRelayWebsocket implements Relay {
  server: WebsocketRelayServer
  client: WebsocketRelayServer

  constructor({server, client}:
    {server: WebsocketRelayServer, client: WebsocketRelayServer}) {
    this.server = server
    this.client = client
  }

  static async start({serverPort, clientPort}: {serverPort: number, clientPort: number}) {
    const server = WebsocketRelayServer.start({port: serverPort})
    const client = WebsocketRelayServer.start({port: clientPort})

    // from local puppeteer
    server.setOnMessage((serverMessage: IMessage, serverConnection: connection) => {
      console.log('[LocalRelay] callback server.onMessage')
      if (serverMessage.type === 'utf8' && serverMessage.utf8Data) {
        client.send(serverMessage.utf8Data)
      }

      // from remote server
      client.setOnMessage((clientMessage: IMessage) => {
        console.log(`[LocalRelay] ---- callback client.onMessage} ----`)
        if (clientMessage.type === 'utf8' && clientMessage.utf8Data) {
          serverConnection.sendUTF(clientMessage.utf8Data)
        }
      })
    })

    const instance = new LocalRelayWebsocket({server, client})
    return instance
  }

  get endpoint() {
    return this.server.endpoint
  }

  get serverEndpoint() {
    return this.server.endpoint
  }

  get clientEndpoint() {
    return this.client.endpoint
  }
}
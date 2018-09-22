import { Relay } from "./relay";
import { CloudPubSub, Event } from "../pubsub";
import { IMessage, connection } from "websocket";
import { WebsocketRelayClient } from "../websocket/client";

const counter = {}

// in: PubSub
// out: WebSocket
export class RemoteRelayPubsub implements Relay {
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

      if (counter[serverMessage.id]) {
        counter[serverMessage.id] += 1
        console.log(`[RemoteRelay] WARNING: ${serverMessage.id} called ${counter[serverMessage.id]} times!!!`)
      }
      else {
        counter[serverMessage.id] = 1
      }

      client.send(serverMessage.data)

      // websocket
      client.setOnMessage((clientMessage: IMessage, _clientConnection: connection) => {
        console.log('[RemoteRelay] callback client.onMessage')
        if (clientMessage.type === 'utf8' && clientMessage.utf8Data) {
          server.send(clientMessage.utf8Data)
        }
      })
    })

    const instance = new RemoteRelayPubsub({server, client})
    return instance
  }
}

// in: WebSocket client
// out: WebSocket client
export class RemoteRelayWebsocket implements Relay {
  server: WebsocketRelayClient
  client: WebsocketRelayClient

  constructor({server, client}:
    {server: WebsocketRelayClient, client: WebsocketRelayClient}) {
    this.server = server
    this.client = client
  }

  static async start({relayUrl, localServerUrl}: {relayUrl: string, localServerUrl: string}) {
    console.log('[RemoteRelay] connect to local server')
    const server = await WebsocketRelayClient.connect(localServerUrl)
    console.log('[RemoteRelay] connect to remote puppeteer')
    const client = await WebsocketRelayClient.connect(relayUrl)

    // from local server
    server.setOnMessage((serverMessage: IMessage, _serverConnection: connection) => {
      console.log(`[RemoteRelay] callback server.setOnMessage`)
      if (serverMessage.type === 'utf8' && serverMessage.utf8Data) {
        client.send(serverMessage.utf8Data)
      }

      // from remote puppeteer
      client.setOnMessage((clientMessage: IMessage, _clientConnection: connection) => {
        console.log('[RemoteRelay] callback client.onMessage')
        if (clientMessage.type === 'utf8' && clientMessage.utf8Data) {
          server.send(clientMessage.utf8Data)
        }
      })
    })

    const instance = new RemoteRelayWebsocket({server, client})
    return instance
  }
}
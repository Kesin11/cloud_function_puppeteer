import { RelayClient } from './websocket/client'
import { RelayServer } from './websocket/server'

// 自分自身に立てたサーバーに接続しにいくことに成功
const main = async() => {
  const server = await RelayServer.start({port: 8080})

  const client = await RelayClient.connect('ws://localhost:8080/')
  client.send('send message')
}
main()
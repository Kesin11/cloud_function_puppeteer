import { server as WebSocketServer, request, connection} from 'websocket'
import http from 'http'
import { RelayServer } from '../relay/relay';
 
export class WebsocketRelayServer implements RelayServer {
  server?: http.Server
  port: number
  onMessage?: Function
  endpoint: string
  _connection?: connection

  constructor({port}: {port: number}) {
    this.server = undefined
    this.port = port
    this.onMessage = undefined
    this.endpoint = `ws://localhost:${port}`
    this._connection = undefined
  }

  static start({port}: {port: number}) {
    const instance = new WebsocketRelayServer({port})
    instance.server = http.createServer(function(req, res) {
      console.log('[Server] ' + (new Date()) + ' Received request for ' + req.url)
      res.writeHead(404)
      res.end()
    })
    instance.server.listen(instance.port, function() {
      console.log(`[Server] ${new Date()} Server is listening on port ${port}`)
    })

    const wsServer = new WebSocketServer({
      httpServer: instance.server,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      // autoAcceptConnections: true
    });
    wsServer.on('request', instance.onConnection.bind(instance))

    return instance
  }

  onConnection(req: request) {
    const conn = req.accept(req.origin);
    this._connection = conn
    console.log('[Server] ' + (new Date()) + ' Connection accepted.');

    conn.on('message', (message) => {
      console.log(`[Server] ---- received Message: ${message.utf8Data} ----`)
      // console.log(`[Server] ---- received Message: ----`)
      // 外から差し込んだonMessageのcallbackを呼び出す
      if ( this.onMessage ) this.onMessage(message, conn)
    })
    conn.on('close', (_reasonCode: number, _description: string) => {
      console.log('[Server] ' + (new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected.');
    })
  }

  setOnMessage(callback: Function) {
    this.onMessage = callback
  }

  send(message: string) {
    if(this._connection === undefined) return

    this._connection.sendUTF(message)
  }
}
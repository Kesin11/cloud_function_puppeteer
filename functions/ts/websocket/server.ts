import { server as WebSocketServer } from 'websocket'
import http from 'http'
import { Server } from '../relay/relay';
 
export class RelayServer implements Server {
  server?: http.Server
  port: number
  onMessage?: Function
  endpoint: string

  constructor({port}: {port: number}) {
    this.server = undefined
    this.port = port
    this.onMessage = undefined
    this.endpoint = `ws://localhost:${port}`
  }

  static start({port}: {port: number}) {
    const instance = new RelayServer({port})
    instance.server = http.createServer(function(request, response) {
      console.log('[Server] ' + (new Date()) + ' Received request for ' + request.url)
      response.writeHead(404)
      response.end()
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

  onConnection(request) {
    const connection = request.accept(request.origin);
    console.log('[Server] ' + (new Date()) + ' Connection accepted.');

    connection.on('message', (message: any) => {
      console.log('[Server] received Message: ')
      console.dir(message)
      // 外から差し込んだonMessageのcallbackを呼び出す
      if ( this.onMessage ) this.onMessage(message, connection)
      // if (message.type === 'utf8') {
      //     connection.sendUTF(message.utf8Data);
      // }
    })
    connection.on('close', (reasonCode: string, description: string) => {
      console.log('[Server] ' + (new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    })
  }

  setOnMessage(callback: Function) {
    this.onMessage = callback
  }
}
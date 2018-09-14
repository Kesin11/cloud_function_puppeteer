import { server as WebSocketServer } from 'websocket'
import http from 'http'
 
export class RelayServer {
  server?: http.Server
  port: number

  constructor({port}: {port: number}) {
    this.server = undefined
    this.port = port
  }

  static start() {
    const instance = new RelayServer({port: 8080})
    instance.server = http.createServer(function(request, response) {
      console.log('[Server] ' + (new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    });
    instance.server.listen(instance.port, function() {
      console.log('[Server] ' + (new Date()) + ' Server is listening on port 8080');
    });

    const wsServer = new WebSocketServer({
      httpServer: instance.server,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      // autoAcceptConnections: true
    });
    wsServer.on('request', instance.onConnection)

    return instance
  }

  onConnection(request) {
    const connection = request.accept(request.origin);
    console.log('[Server] ' + (new Date()) + ' Connection accepted.');

    connection.on('message', (message: any) => {
      if (message.type === 'utf8') {
          console.log(`[Server] received Message: '${message.utf8Data}'`);
          connection.sendUTF(message.utf8Data);
      }
    })
    connection.on('close', (reasonCode: string, description: string) => {
      console.log('[Server] ' + (new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    })
  }
}
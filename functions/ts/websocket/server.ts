import { server as WebSocketServer } from 'websocket'
import http from 'http'
 
export class RelayServer {
  server?: http.Server
  port: number
  protocol: string

  constructor({port, protocol}: {port: number, protocol: string}) {
    this.server = undefined
    this.port = port
    this.protocol = protocol
  }

  static start() {
    const instance = new RelayServer({port: 8080, protocol: 'echo-protocol'})
    instance.server = http.createServer(function(request, response) {
      console.log((new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    });
    instance.server.listen(instance.port, function() {
      console.log((new Date()) + ' Server is listening on port 8080');
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
    // TODO: thisにインスタンスがbindされていないのでthis.protocolが使えない。あとで考える
    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', (message: any) => {
      if (message.type === 'utf8') {
          console.log('Received Message: ' + message.utf8Data);
          connection.sendUTF(message.utf8Data);
      }
    })
    connection.on('close', (reasonCode: string, description: string) => {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    })
  }
}

const main = () =>{
  const server = RelayServer.start()
}
main()
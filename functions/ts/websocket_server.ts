import http from 'http'
import { server as WebSocketServer } from 'websocket'

const server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  // autoAcceptConnections: true
});

wsServer.on('request', function(request: any) {
  const connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message: any) {
      if (message.type === 'utf8') {
          console.log('Received Message: ' + message.utf8Data);
          connection.sendUTF(message.utf8Data);
      }
  });
  connection.on('close', function(reasonCode: string, description: string) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
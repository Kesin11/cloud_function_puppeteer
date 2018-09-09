import { client as WebSocketClient } from 'websocket'
 
export class RelayClient {
    client: any
    connection?: any
    sendReady?: Promise<boolean>

    static async connect(url: string, protocol: string) {
        const instance = new RelayClient()

        instance.sendReady = new Promise((resolve, reject) => {
            instance.client.on('connectFailed', (error) => {
                instance.onConnectionFailed(error)
                reject()
            })
            instance.client.on('connect', (connection) => {
                instance.connection = connection
                instance.onConnect(connection)
                resolve()
            })
        })
        instance.client.connect(url, protocol)

        // instance.client.on('connect')によってconnectionがセットされるまで待つ
        await instance.sendReady
        return instance
    }
    constructor() {
        this.client = new WebSocketClient();
        this.connection = undefined
        this.sendReady = undefined
    }

    onConnectionFailed(error) {
        console.log('Connect Error: ' + error.toString());
    }

    onConnect(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        })
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        })
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        })
    }

    send(message: string) {
        if (this.connection.connected) {
            this.connection.sendUTF(message)
        }
    }
}

const main = async () => {
    const client = await RelayClient.connect('ws://localhost:8080/', 'echo-protocol')
    client.send('send message')
}
main()
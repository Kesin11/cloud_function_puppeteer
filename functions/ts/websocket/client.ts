import { client as WebSocketClient } from 'websocket'
import { Client } from '../relay/relay';
 
export class RelayClient implements Client {
    client: any
    connection?: any
    sendReady?: Promise<boolean>
    onMessage?: Function

    constructor() {
        this.client = new WebSocketClient();
        this.connection = undefined
        this.sendReady = undefined
    }

    static async connect(url: string) {
        const instance = new RelayClient()

        instance.sendReady = new Promise((resolve, reject) => {
            instance.client.on('connectFailed', (error) => {
                instance.onConnectionFailed(error)
                reject()
            })
            instance.client.on('connect', (connection) => {
                console.log(`[client] connect to ${url}`)
                instance.connection = connection
                instance.onConnect(connection)
                resolve()
            })
        })
        instance.client.connect(url)

        // instance.client.on('connect')によってconnectionがセットされるまで待つ
        await instance.sendReady
        return instance
    }

    onConnectionFailed(error) {
        console.log('[Client] Connect Error: ' + error.toString());
    }

    onConnect(connection) {
        console.log('[Client] WebSocket Client Connected');
        connection.on('error', (error) => {
            console.log("[Client] Connection Error: " + error.toString());
        })
        connection.on('close', () => {
            console.log('[Client]: Connection Closed');
        })
        connection.on('message', (message) => {
            console.log("[Client] received: '" + message.utf8Data + "'");
            if (message.type === 'utf8') {
                if (this.onMessage) this.onMessage(message)
            }
        })
    }

    // TODO: messageは後でインターフェースを作っておく
    send(message: any) {
        if (this.connection.connected) {
            console.log(`[Client] send:`)
            console.dir(message)
            this.connection.sendUTF(message.utf8Data)
        }
    }

    setOnMessage(callback: Function) {
        this.onMessage = callback
    }
}
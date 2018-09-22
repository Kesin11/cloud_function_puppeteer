import { client as WebSocketClient } from 'websocket'
import { RelayClient } from '../relay/relay';
 
export class WebsocketRelayClient implements RelayClient {
    client: any
    connection?: any
    sendReady?: Promise<boolean>
    onMessage?: Function
    delay: number

    constructor({delay}: {delay?: number}) {
        this.client = new WebSocketClient();
        this.connection = undefined
        this.sendReady = undefined
        this.delay = delay || 100
    }

    static async connect(url: string, delay?: number) {
        const instance = new WebsocketRelayClient({delay})

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
        connection.on('message', async (message) => {
            // console.log("[Client] received: '" + message.utf8Data + "'");
            // for stabilize puppeteer
            await new Promise((resolve) => setTimeout(resolve, this.delay))
            if (message.type === 'utf8') {
                if (this.onMessage) this.onMessage(message)
            }
        })
    }

    send(message: string) {
        if (this.connection.connected) {
            console.log(`[Client] send method: ${JSON.parse(message).method}`)
            this.connection.sendUTF(message)
        }
    }

    setOnMessage(callback: Function) {
        this.onMessage = callback
    }
}
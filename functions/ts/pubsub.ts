import PubSub from '@google-cloud/pubsub'

class CloudPubSub {
  pubsub: PubSub
  topic: string
  subscription: any
  onMessage?: Function

  static async create() {
    const instance = new CloudPubSub()
    const readyPromise = new Promise((resolve) => {
      // subscription.onによってhandleMessageがセットされるまで待つ
      instance.subscription.on('message', (message) => {
        instance.handleMessage(message)
        resolve()
      })
    })

    await readyPromise
    return instance
  }

  constructor() {
    this.pubsub = new PubSub()
    this.topic = 'puppeteer-ws'
    this.subscription = this.pubsub.subscription('puppeteer-ws-sub')
    this.onMessage = undefined
  }

  async publish(data) {
    const dataBuffer = Buffer.from(data)

    try {
      const messageId = await this.pubsub
        .topic(this.topic)
        .publisher()
        .publish(dataBuffer)
      
      console.log(`[pubsub] publish messageId: ${messageId}, ${data}`)
    } catch (error) {
      console.error(`[pubsub] ERROR: ${error}`)
    }
  }

  handleMessage(message) {
    if (this.onMessage) {
      console.log(`[pubsub] handleMessage ${message.id}`)
      this.onMessage(message)

      message.ack()
    }
  }

  setOnMessage(callback) {
    this.onMessage = callback
  }
}

const main = async () => {
  const pubsub = await CloudPubSub.create()

  // このブロックがメッセージ受診時に実行される
  pubsub.setOnMessage((message) => {
    const data = JSON.parse(message.data)
    console.log('callback: %o', data)
  })

  pubsub.publish(JSON.stringify({id: 1, message: 'test hogehoge'}))
}
main()
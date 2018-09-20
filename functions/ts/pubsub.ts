import PubSub from '@google-cloud/pubsub'
import { RelayClient } from './relay/relay';

export interface Event {
  id: string
  ackId: string
  data: string
  attributes: [string]
  timestamp: string
  ack: () => void
  nack: () => void
}

type PubSubTopic = 'local2remote' | 'remote2local'

export class CloudPubSub implements RelayClient {
  pubsub: PubSub
  topic: PubSubTopic
  subscription: any
  onMessage?: Function
  publish = this.send.bind(this)
  subscript: string // for debug

  static async create({topic, subscription}: {topic: PubSubTopic, subscription: string}) {
    const instance = new CloudPubSub({topic, subscription})
    instance.subscription.on('message', (message: Event) => {
      instance.handleMessage(message)
    })
    return instance
  }

  constructor({topic, subscription}: {topic: PubSubTopic, subscription: string}) {
    this.pubsub = new PubSub()
    this.topic = topic
    this.subscription = this.pubsub.subscription(subscription)
    this.onMessage = undefined
    this.subscript = subscription
  }

  async send(data: string) {
    const dataBuffer = Buffer.from(data)

    try {
      const messageId = await this.pubsub
        .topic(this.topic)
        .publisher()
        .publish(dataBuffer)
      
      // console.log(`[pubsub] publish topic: ${this.topic} messageId: ${messageId}, ${data}`)
      console.log(`[pubsub] publish topic: ${this.topic} messageId: ${messageId}`)
    } catch (error) {
      console.error(`[pubsub] ERROR: ${error}`)
    }
  }

  handleMessage(message: Event) {
    if (this.onMessage) {
      console.log(`[pubsub] handleMessage subscript: ${this.subscript} messageId: ${message.id}`)
      this.onMessage(message)

      message.ack()
    }
  }

  setOnMessage(callback) {
    this.onMessage = callback
  }
}
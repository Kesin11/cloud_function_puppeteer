export interface Relay {
  server: RelayServer
  client: RelayClient
  endpoint: string
}

export interface RelayServer {
  endpoint: string
  setOnMessage: (callback: () => void) => void
}

export interface RelayClient {
  setOnMessage: (callback: () => void) => void
}

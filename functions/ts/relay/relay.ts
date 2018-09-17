export interface Relay {
  server: RelayServer
  client: RelayClient
}

export interface RelayServer {
  setOnMessage: (callback: () => void) => void
}

export interface RelayClient {
  setOnMessage: (callback: () => void) => void
  send: (message: string) => void
}

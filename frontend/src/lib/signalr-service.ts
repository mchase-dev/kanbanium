import * as signalR from '@microsoft/signalr'

type EventCallback = (data: any) => void

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private readonly baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5124'
  private eventHandlers: Map<string, EventCallback[]> = new Map()
  private connectionPromise: Promise<void> | null = null

  async connect(accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected')
      return
    }

    if (this.connectionPromise) {
      console.log('SignalR connection already in progress')
      return this.connectionPromise
    }

    this.connectionPromise = this.establishConnection(accessToken)
    await this.connectionPromise
    this.connectionPromise = null
  }

  private async establishConnection(accessToken: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/kanban`, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
          if (retryContext.previousRetryCount === 0) return 0
          if (retryContext.previousRetryCount === 1) return 2000
          if (retryContext.previousRetryCount === 2) return 10000
          if (retryContext.previousRetryCount === 3) return 30000
          return 60000
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build()

    // Set up connection event handlers
    this.connection.onclose((error) => {
      console.log('SignalR connection closed', error)
    })

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId)
    })

    // Register all existing event handlers with the new connection
    this.eventHandlers.forEach((callbacks, eventName) => {
      callbacks.forEach((callback) => {
        this.connection!.on(eventName, callback)
      })
    })

    try {
      await this.connection.start()
      console.log('SignalR connected successfully')
    } catch (error) {
      console.error('SignalR connection failed:', error)
      this.connection = null
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR disconnected')
      } catch (error) {
        console.error('Error disconnecting SignalR:', error)
      } finally {
        this.connection = null
        this.eventHandlers.clear()
      }
    }
  }

  async joinBoard(boardId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected')
    }

    try {
      await this.connection.invoke('JoinBoard', boardId)
      console.log(`Joined board: ${boardId}`)
    } catch (error) {
      console.error(`Failed to join board ${boardId}:`, error)
      throw error
    }
  }

  async leaveBoard(boardId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('SignalR not connected, cannot leave board')
      return
    }

    try {
      await this.connection.invoke('LeaveBoard', boardId)
      console.log(`Left board: ${boardId}`)
    } catch (error) {
      console.error(`Failed to leave board ${boardId}:`, error)
    }
  }

  on(eventName: string, callback: EventCallback): void {
    // Store the callback
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, [])
    }
    this.eventHandlers.get(eventName)!.push(callback)

    // If already connected, register the callback immediately
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.on(eventName, callback)
    }
  }

  off(eventName: string, callback?: EventCallback): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.eventHandlers.get(eventName)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    } else {
      // Remove all callbacks for this event
      this.eventHandlers.delete(eventName)
    }

    // If connected, also remove from the connection
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      if (callback) {
        this.connection.off(eventName, callback)
      } else {
        this.connection.off(eventName)
      }
    }
  }

  getState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null
  }
}

// Export singleton instance
export const signalRService = new SignalRService()

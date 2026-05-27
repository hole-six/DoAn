type SocketLike = {
  connected: boolean
  id?: string
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  emit: (event: string, data?: any) => void
  disconnect: () => void
}

function taoSocketNoop(): SocketLike {
  const listeners = new Map<string, Set<(...args: any[]) => void>>()
  return {
    connected: false,
    on(event, callback) {
      const set = listeners.get(event) ?? new Set()
      set.add(callback)
      listeners.set(event, set)
    },
    off(event, callback) {
      if (!callback) {
        listeners.delete(event)
        return
      }
      listeners.get(event)?.delete(callback)
    },
    emit(event, data) {
      listeners.get(event)?.forEach(callback => callback(data))
    },
    disconnect() {
      listeners.clear()
    },
  }
}

let socket: SocketLike | null = null

export function khoiTaoSocket(_token: string): SocketLike {
  if (!socket) socket = taoSocketNoop()
  return socket
}

export function ngatketnoisocket() {
  socket?.disconnect()
  socket = null
}

export function laySocket(): SocketLike | null {
  return socket
}

export function langNgheEvent(event: string, callback: (...args: any[]) => void) {
  socket?.on(event, callback)
}

export function guiEvent(event: string, data?: any) {
  socket?.emit(event, data)
}

export function boLangNgheEvent(event: string, callback?: (...args: any[]) => void) {
  socket?.off(event, callback)
}

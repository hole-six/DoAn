import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from './env'

const CONNECT_EVENT = 'connect'
const DISCONNECT_EVENT = 'disconnect'
const RECONNECT_EVENT = 'reconnect'
const CONNECT_ERROR_EVENT = 'connect_error'

let socket: Socket | null = null

export function khoiTaoSocket(token: string): Socket {
  if (socket?.connected) return socket

  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on(CONNECT_EVENT, () => {
    console.log('Socket.IO connected:', socket?.id)
  })

  socket.on(DISCONNECT_EVENT, reason => {
    console.log('Socket.IO disconnected:', reason)
  })

  socket.on(RECONNECT_EVENT, () => {
    console.log('Socket.IO reconnected')
  })

  socket.on(CONNECT_ERROR_EVENT, err => {
    console.warn('Socket.IO connect error:', err.message)
  })

  return socket
}

export function ngatketnoisocket() {
  socket?.disconnect()
  socket = null
}

export function laySocket(): Socket | null {
  return socket
}

export function langNgheEvent(event: string, callback: (...args: any[]) => void) {
  socket?.on(event, callback)
}

export function guiEvent(event: string, data?: any) {
  socket?.emit(event, data)
}

export function boLangNgheEvent(event: string, callback?: (...args: any[]) => void) {
  if (callback) {
    socket?.off(event, callback)
  } else {
    socket?.off(event)
  }
}

export function kiemTraKetNoi(): boolean {
  return socket?.connected ?? false
}

export function langNgheTrangThaiKetNoi(
  handlers: {
    onConnect?: () => void
    onDisconnect?: (reason: Socket.DisconnectReason) => void
    onReconnect?: () => void
    onConnectError?: (error: Error) => void
  },
) {
  if (!socket) return () => undefined

  const { onConnect, onDisconnect, onReconnect, onConnectError } = handlers

  if (onConnect) socket.on(CONNECT_EVENT, onConnect)
  if (onDisconnect) socket.on(DISCONNECT_EVENT, onDisconnect)
  if (onReconnect) socket.on(RECONNECT_EVENT, onReconnect)
  if (onConnectError) socket.on(CONNECT_ERROR_EVENT, onConnectError)

  return () => {
    if (onConnect) socket?.off(CONNECT_EVENT, onConnect)
    if (onDisconnect) socket?.off(DISCONNECT_EVENT, onDisconnect)
    if (onReconnect) socket?.off(RECONNECT_EVENT, onReconnect)
    if (onConnectError) socket?.off(CONNECT_ERROR_EVENT, onConnectError)
  }
}

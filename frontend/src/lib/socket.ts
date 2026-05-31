import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000'

let socket: Socket | null = null

export function khoiTaoSocket(token: string): Socket {
  if (socket?.connected) return socket

  // Ngắt kết nối cũ nếu có
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

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket.IO connect error:', err.message)
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

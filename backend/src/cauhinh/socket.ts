import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { bienMoiTruong } from './bienmoitruong.js'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'

export interface NguoiDungSocket {
  _id: string
  email: string
  vaiTro: string
}

type SocketTokenPayload = {
  sub: string
  email: string
  vaiTro: string
  loai?: string
}

export interface SocketXacThuc extends Socket {
  nguoiDung?: NguoiDungSocket
}

import type { Socket } from 'socket.io'

let io: SocketIOServer | null = null

const usersOnline = new Map<string, string[]>() // userId -> [socketId1, socketId2, ...]
const typingUsers = new Map<string, Set<string>>() // conversationId -> Set<userId>

export function khoiTaoSocket(httpServer: HttpServer): SocketIOServer {
  const corsOrigins = Array.from(new Set([
    bienMoiTruong.duongDanFrontend,
    ...bienMoiTruong.corsOrigins,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter(Boolean)))

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Middleware xác thực
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

    if (!token) {
      return next(new Error('Không có token xác thực'))
    }

    try {
      const decoded = jwt.verify(token, bienMoiTruong.khoaJwt) as SocketTokenPayload
      if (decoded.loai && decoded.loai !== 'access') {
        return next(new Error('Token khong hop le'))
      }

      const nguoiDung = await prisma.nguoiDung.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, vaiTro: true, trangThai: true },
      })
      if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') {
        return next(new Error('Tai khoan khong con hieu luc'))
      }

      ;(socket as SocketXacThuc).nguoiDung = {
        _id: String(nguoiDung.id),
        email: nguoiDung.email,
        vaiTro: nguoiDung.vaiTro,
      }
      next()
    } catch (err) {
      next(new Error('Token khong hop le'))
    }
  })

  // Xử lý kết nối
  io.on('connection', (socket: Socket) => {
    const socketXacThuc = socket as SocketXacThuc
    const nguoiDung = socketXacThuc.nguoiDung

    if (!nguoiDung) return

    const userId = String(nguoiDung._id ?? '')
    if (!userId) {
      console.warn('Socket connection rejected due to missing user id')
      socket.disconnect(true)
      return
    }
    console.log(`✅ User connected: ${nguoiDung.email} (${userId})`)

    // Thêm vào danh sách online
    if (!usersOnline.has(userId)) {
      usersOnline.set(userId, [])
    }
    usersOnline.get(userId)!.push(socket.id)

    // Join room theo user ID
    socket.join(`user:${userId}`)

    // Join room theo vai trò
    socket.join(`role:${nguoiDung.vaiTro}`)

    // Gửi thông báo kết nối thành công
    socket.emit('connected', {
      message: 'Ket noi thanh cong',
      userId,
      role: nguoiDung.vaiTro,
    })

    // Broadcast user online status
    io?.emit('user_online', { userId })

    // ============================================
    // CHAT EVENTS
    // ============================================

    /**
     * Join conversation room
     */
    socket.on('join_conversation', (data: { conversationId: string }) => {
      socket.join(`conversation:${data.conversationId}`)
      console.log(`👥 User ${userId} joined conversation ${data.conversationId}`)
    })

    /**
     * Leave conversation room
     */
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      socket.leave(`conversation:${data.conversationId}`)
      console.log(`👋 User ${userId} left conversation ${data.conversationId}`)
    })

    /**
     * Typing indicator
     */
    socket.on('typing_start', (data: { conversationId: string }) => {
      if (!typingUsers.has(data.conversationId)) {
        typingUsers.set(data.conversationId, new Set())
      }
      typingUsers.get(data.conversationId)!.add(userId)

      // Broadcast to others in conversation
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: true,
      })
    })

    socket.on('typing_stop', (data: { conversationId: string }) => {
      if (typingUsers.has(data.conversationId)) {
        typingUsers.get(data.conversationId)!.delete(userId)
      }

      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: false,
      })
    })

    /**
     * Mark message as read (real-time)
     */
    socket.on('message_read', (data: { conversationId: string; messageId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('message_read_receipt', {
        conversationId: data.conversationId,
        messageId: data.messageId,
        userId,
        timestamp: new Date(),
      })
    })

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${nguoiDung.email}`)

      // Remove from online list
      const sockets = usersOnline.get(userId)
      if (sockets) {
        const index = sockets.indexOf(socket.id)
        if (index > -1) {
          sockets.splice(index, 1)
        }
        if (sockets.length === 0) {
          usersOnline.delete(userId)
          // Broadcast user offline
          io?.emit('user_offline', { userId })
        }
      }

      // Clear typing status
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          users.delete(userId)
          io?.to(`conversation:${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            isTyping: false,
          })
        }
      })
    })

    // Xử lý lỗi
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  console.log('🔌 Socket.IO server initialized')
  return io
}

export function laySocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO chua duoc khoi tao')
  }
  return io
}

// Helper functions để gửi thông báo
export function guiThongBaoChoNguoiDung(maNguoiDung: string, event: string, data: any) {
  if (!io) return
  io.to(`user:${maNguoiDung}`).emit(event, data)
}

export function guiThongBaoChoVaiTro(vaiTro: string, event: string, data: any) {
  if (!io) return
  io.to(`role:${vaiTro}`).emit(event, data)
}

export function guiThongBaoChoTatCa(event: string, data: any) {
  if (!io) return
  io.emit(event, data)
}

// Helper để kiểm tra user online
export function kiemTraUserOnline(userId: string): boolean {
  return usersOnline.has(userId) && usersOnline.get(userId)!.length > 0
}

// Helper để lấy danh sách user online
export function layDanhSachUserOnline(): string[] {
  return Array.from(usersOnline.keys())
}




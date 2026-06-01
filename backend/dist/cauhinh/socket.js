"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.khoiTaoSocket = khoiTaoSocket;
exports.laySocketIO = laySocketIO;
exports.guiThongBaoChoNguoiDung = guiThongBaoChoNguoiDung;
exports.guiThongBaoChoVaiTro = guiThongBaoChoVaiTro;
exports.guiThongBaoChoTatCa = guiThongBaoChoTatCa;
exports.kiemTraUserOnline = kiemTraUserOnline;
exports.layDanhSachUserOnline = layDanhSachUserOnline;
const socket_io_1 = require("socket.io");
const bienmoitruong_js_1 = require("./bienmoitruong.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nguoidung_mohinh_js_1 = require("../modules/nguoidung/nguoidung.mohinh.js");
let io = null;
// Map để theo dõi user online
const usersOnline = new Map(); // userId -> [socketId1, socketId2, ...]
const typingUsers = new Map(); // conversationId -> Set<userId>
function khoiTaoSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [
                bienmoitruong_js_1.bienMoiTruong.duongDanFrontend,
                'http://localhost:3000',
                'http://localhost:5173',
                'http://localhost:5174',
            ],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    // Middleware xác thực
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Khong co token xac thuc'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, bienmoitruong_js_1.bienMoiTruong.khoaJwt);
            if (decoded.loai && decoded.loai !== 'access') {
                return next(new Error('Token khong hop le'));
            }
            const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findById(decoded.sub).select('_id email vaiTro trangThai');
            if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') {
                return next(new Error('Tai khoan khong con hieu luc'));
            }
            ;
            socket.nguoiDung = {
                _id: String(nguoiDung._id),
                email: nguoiDung.email,
                vaiTro: nguoiDung.vaiTro,
            };
            next();
        }
        catch (err) {
            next(new Error('Token khong hop le'));
        }
    });
    // Xử lý kết nối
    io.on('connection', (socket) => {
        const socketXacThuc = socket;
        const nguoiDung = socketXacThuc.nguoiDung;
        if (!nguoiDung)
            return;
        const userId = String(nguoiDung._id ?? '');
        if (!userId) {
            console.warn('Socket connection rejected due to missing user id');
            socket.disconnect(true);
            return;
        }
        console.log(`✅ User connected: ${nguoiDung.email} (${userId})`);
        // Thêm vào danh sách online
        if (!usersOnline.has(userId)) {
            usersOnline.set(userId, []);
        }
        usersOnline.get(userId).push(socket.id);
        // Join room theo user ID
        socket.join(`user:${userId}`);
        // Join room theo vai trò
        socket.join(`role:${nguoiDung.vaiTro}`);
        // Gửi thông báo kết nối thành công
        socket.emit('connected', {
            message: 'Ket noi thanh cong',
            userId,
            role: nguoiDung.vaiTro,
        });
        // Broadcast user online status
        io?.emit('user_online', { userId });
        // ============================================
        // CHAT EVENTS
        // ============================================
        /**
         * Join conversation room
         */
        socket.on('join_conversation', (data) => {
            socket.join(`conversation:${data.conversationId}`);
            console.log(`👥 User ${userId} joined conversation ${data.conversationId}`);
        });
        /**
         * Leave conversation room
         */
        socket.on('leave_conversation', (data) => {
            socket.leave(`conversation:${data.conversationId}`);
            console.log(`👋 User ${userId} left conversation ${data.conversationId}`);
        });
        /**
         * Typing indicator
         */
        socket.on('typing_start', (data) => {
            if (!typingUsers.has(data.conversationId)) {
                typingUsers.set(data.conversationId, new Set());
            }
            typingUsers.get(data.conversationId).add(userId);
            // Broadcast to others in conversation
            socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
                conversationId: data.conversationId,
                userId,
                isTyping: true,
            });
        });
        socket.on('typing_stop', (data) => {
            if (typingUsers.has(data.conversationId)) {
                typingUsers.get(data.conversationId).delete(userId);
            }
            socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
                conversationId: data.conversationId,
                userId,
                isTyping: false,
            });
        });
        /**
         * Mark message as read (real-time)
         */
        socket.on('message_read', (data) => {
            socket.to(`conversation:${data.conversationId}`).emit('message_read_receipt', {
                conversationId: data.conversationId,
                messageId: data.messageId,
                userId,
                timestamp: new Date(),
            });
        });
        // ============================================
        // DISCONNECT
        // ============================================
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${nguoiDung.email}`);
            // Remove from online list
            const sockets = usersOnline.get(userId);
            if (sockets) {
                const index = sockets.indexOf(socket.id);
                if (index > -1) {
                    sockets.splice(index, 1);
                }
                if (sockets.length === 0) {
                    usersOnline.delete(userId);
                    // Broadcast user offline
                    io?.emit('user_offline', { userId });
                }
            }
            // Clear typing status
            typingUsers.forEach((users, conversationId) => {
                if (users.has(userId)) {
                    users.delete(userId);
                    io?.to(`conversation:${conversationId}`).emit('user_typing', {
                        conversationId,
                        userId,
                        isTyping: false,
                    });
                }
            });
        });
        // Xử lý lỗi
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
    console.log('🔌 Socket.IO server initialized');
    return io;
}
function laySocketIO() {
    if (!io) {
        throw new Error('Socket.IO chua duoc khoi tao');
    }
    return io;
}
// Helper functions để gửi thông báo
function guiThongBaoChoNguoiDung(maNguoiDung, event, data) {
    if (!io)
        return;
    io.to(`user:${maNguoiDung}`).emit(event, data);
}
function guiThongBaoChoVaiTro(vaiTro, event, data) {
    if (!io)
        return;
    io.to(`role:${vaiTro}`).emit(event, data);
}
function guiThongBaoChoTatCa(event, data) {
    if (!io)
        return;
    io.emit(event, data);
}
// Helper để kiểm tra user online
function kiemTraUserOnline(userId) {
    return usersOnline.has(userId) && usersOnline.get(userId).length > 0;
}
// Helper để lấy danh sách user online
function layDanhSachUserOnline() {
    return Array.from(usersOnline.keys());
}

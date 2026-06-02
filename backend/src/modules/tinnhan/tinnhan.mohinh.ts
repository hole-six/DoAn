import { Schema, model } from 'mongoose'

// ============================================
// CONVERSATION MODEL (Cuá»™c há»™i thoáº¡i)
// ============================================

export const loaiCuocTroChuyenEnum = ['ung_vien_nha_tuyen_dung', 'admin_support', 'nhom_cong_dong'] as const

const cuocTroChuyenSchema = new Schema(
  {
    // Participants
    nguoiThamGia: [{ type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true }],
    
    // Type
    loai: { type: String, enum: loaiCuocTroChuyenEnum, default: 'ung_vien_nha_tuyen_dung' },

    // TÃªn nhÃ³m (dÃ¹ng cho nhom_cong_dong)
    tenNhom: { type: String },
    moTaNhom: { type: String },
    anhNhom: { type: String },

    // Chá»‰ dÃ¹ng cho nhom_cong_dong â€” ai lÃ  admin nhÃ³m
    quanTriNhom: [{ type: Schema.Types.ObjectId, ref: 'NguoiDung' }],
    
    // Context (náº¿u chat vá» há»“ sÆ¡ á»©ng tuyá»ƒn cá»¥ thá»ƒ)
    maHoSoUngTuyen: { type: Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maTinTuyenDung: { type: Schema.Types.ObjectId, ref: 'TinTuyenDung' },
    
    // Last message info (Ä‘á»ƒ hiá»ƒn thá»‹ preview)
    tinNhanCuoiCung: {
      noiDung: String,
      nguoiGui: { type: Schema.Types.ObjectId, ref: 'NguoiDung' },
      thoiGian: Date,
    },
    
    // Unread counts per user
    soChuaDoc: {
      type: Map,
      of: Number,
      default: {},
    },
    
    // Status
    daLuuTru: { type: Boolean, default: false },
    thoiGianLuuTru: Date,
  },
  {
    collection: 'cuoc_tro_chuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

// Indexes
cuocTroChuyenSchema.index({ nguoiThamGia: 1, ngayCapNhat: -1 })
cuocTroChuyenSchema.index({ maHoSoUngTuyen: 1 })
cuocTroChuyenSchema.index({ daLuuTru: 1 })

export const CuocTroChuyenModel = model<any>('CuocTroChuyenModel', cuocTroChuyenSchema)

// ============================================
// MESSAGE MODEL (Tin nháº¯n)
// ============================================

export const loaiTinNhanEnum = ['text', 'file', 'image', 'system'] as const

const tinNhanSchema = new Schema(
  {
    // Conversation reference
    maCuocTroChuyenId: { type: Schema.Types.ObjectId, ref: 'CuocTroChuyenModel', required: true, index: true },
    
    // Sender
    nguoiGui: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    
    // Content
    loai: { type: String, enum: loaiTinNhanEnum, default: 'text' },
    noiDung: { type: String, required: true },
    
    // File attachments
    tepDinhKem: [{
      tenFile: String,
      duongDan: String,
      kichThuoc: Number,
      loaiFile: String,
    }],
    
    // Reply to another message
    traloiTinNhan: { type: Schema.Types.ObjectId, ref: 'TinNhanModel' },
    
    // Read receipts
    daDuocDocBoi: [{
      nguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung' },
      thoiGian: { type: Date, default: Date.now },
    }],
    
    // Reactions
    phanUng: [{
      nguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung' },
      emoji: String,
    }],
    
    // Status
    daXoa: { type: Boolean, default: false },
    daChinhSua: { type: Boolean, default: false },
    thoiGianChinhSua: Date,
  },
  {
    collection: 'tin_nhan',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

// Indexes
tinNhanSchema.index({ maCuocTroChuyenId: 1, ngayTao: -1 })
tinNhanSchema.index({ nguoiGui: 1 })
tinNhanSchema.index({ daXoa: 1 })

export const TinNhanModel = model<any>('TinNhanModel', tinNhanSchema)



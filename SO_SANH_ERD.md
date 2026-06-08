# SO SÁNH ERD: THIẾT KẾ vs TRIỂN KHAI THỰC TẾ
## Hệ thống EffortIT

---

## PHẦN 1: PHÂN TÍCH ERD TRONG HÌNH ẢNH

### Các bảng/Collection trong ERD đã vẽ:

1. **NGUOIDUNG** (nguoi_dung)
2. **UNGVIEN** (ung_vien) 
3. **NHATUYENDUNG** (nha_tuyen_dung)
4. **TINTUYENDUNG** (tin_tuyen_dung)
5. **HOSONANGLUC** (ho_so_nang_luc)
6. **HOSOUNGTUYEN** (ho_so_ung_tuyen)
7. **LICHPHONGVAN** (lich_phong_van)
8. **THONGBAO** (thong_bao)
9. **DANHMUC_KYNANG** (danh_muc_ky_nang)
10. **UNGVIEN_KYNANG** (embedded trong ung_vien)
11. **TINTUYENDUNG_KYNANG** (embedded trong tin_tuyen_dung)
12. **DANHGIA_CONGTY** (danh_gia_cong_ty) - *Có thể có nhưng không rõ trong hình*

---

## PHẦN 2: CÁC BẢNG TRONG HỆ THỐNG THỰC TẾ

### 2.1. Bảng có trong cả ERD thiết kế và hệ thống

| STT | Collection | Trạng thái | Ghi chú |
|-----|-----------|------------|---------|
| 1 | **nguoi_dung** | ✅ Khớp | Đầy đủ |
| 2 | **ung_vien** | ✅ Khớp | Có embedded: kyNang[], portfolio[] |
| 3 | **nha_tuyen_dung** | ⚠️ Khác biệt | Thiếu/Thừa một số trường |
| 4 | **tin_tuyen_dung** | ⚠️ Khác biệt | Có embedded: kyNang[] |
| 5 | **danh_muc_ky_nang** | ✅ Khớp | Đầy đủ |
| 6 | **ho_so_nang_luc** | ⚠️ Khác biệt | Hệ thống có nhiều trường hơn |
| 7 | **ho_so_ung_tuyen** | ✅ Khớp | Đầy đủ |
| 8 | **lich_phong_van** | ✅ Khớp | Đầy đủ |
| 9 | **thong_bao** | ⚠️ Khác biệt | Hệ thống có nhiều trường hơn |
| 10 | **danh_gia_cong_ty** | ⚠️ Cần xác nhận | Có trong hệ thống, cần bổ sung vào ERD |

### 2.2. Bảng CÓ trong hệ thống NHƯNG KHÔNG CÓ trong ERD thiết kế

| STT | Collection | Mô tả | Cần bổ sung vào ERD |
|-----|-----------|-------|---------------------|
| 11 | **viec_lam_da_luu** | Lưu việc làm yêu thích | ✅ BẮT BUỘC |
| 12 | **lich_su_ho_so_ung_tuyen** | Lịch sử thay đổi trạng thái hồ sơ | ✅ BẮT BUỘC |
| 13 | **cuoc_tro_chuyen** | Chat/Message conversation | ✅ BẮT BUỘC |
| 14 | **tin_nhan** | Message content | ✅ BẮT BUỘC |
| 15 | **goi_y_viec_lam** | AI job recommendation | ✅ QUAN TRỌNG |

---

## PHẦN 3: CHI TIẾT KHÁC BIỆT THEO TỪNG BẢNG

### 3.1. **nha_tuyen_dung** - Có khác biệt

#### ERD Thiết kế (từ hình):
```
_id: ObjectId (PK)
maNguoiDung: ObjectId (FK)
tenCongTy: String
moTa: String
diaChi: String
website: String
logo: String
quyMo: Number
nganh: String
ngayTao: DateTime
ngayCapNhat: DateTime
```

#### Hệ thống Thực tế:
```typescript
_id: ObjectId (PK)
maNguoiDung: ObjectId (FK, UNIQUE)
tenCongTy: String (required)
maSoThue: String                    // ⚠️ THIẾU trong ERD
moTa: String
diaChi: String (default: 'Da Nang')
website: String
logo: String
quyMo: Number
nganh: String (default: 'Cong nghe thong tin')
trangThaiDuyet: Enum                // ⚠️ THIẾU trong ERD
  ['cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa']
lyDoTuChoi: String                  // ⚠️ THIẾU trong ERD
ngayDuyet: Date                     // ⚠️ THIẾU trong ERD
ngayTao: Date
ngayCapNhat: Date
```

**Cần bổ sung vào ERD:**
- ✅ `maSoThue: String` - Mã số thuế công ty
- ✅ `trangThaiDuyet: Enum` - Trạng thái duyệt công ty
- ✅ `lyDoTuChoi: String` - Lý do từ chối (nếu bị từ chối)
- ✅ `ngayDuyet: Date` - Ngày admin duyệt

---

### 3.2. **tin_tuyen_dung** - Có khác biệt

#### Hệ thống có THÊM các trường sau (so với ERD):

```typescript
anhDaiDien: String                  // ⚠️ THIẾU trong ERD (nếu không có)
ngayDang: Date                      // ⚠️ THIẾU (nếu không có)
```

**Text search index:**
```typescript
index: { tieuDe: 'text', moTa: 'text', yeuCau: 'text' }
```

---

### 3.3. **ho_so_nang_luc** - RẤT NHIỀU khác biệt

#### Hệ thống có NHIỀU trường hơn ERD rất nhiều:

```typescript
// Các trường CƠ BẢN (thường có trong ERD)
_id, maUngVien, tieuDe, hoTenHienThi, chucDanh, emailLienHe, 
soDienThoai, hocVan[], kinhNghiemLam[], kyNangLapTrinh[], 
duAnChiTiet[], fileCvTen, fileCvData, fileCvText, 
loaiHoSo, cvChinh, congKhai

// ⚠️ CÁC TRƯỜNG BỔ SUNG (cần thêm vào ERD):
facebook: String                    // Link Facebook
github: String                      // Link GitHub
portfolioUrl: String                // Link Portfolio
diaDiem: String                     // Địa điểm cư trú
tomTatKinhNghiem: String[]         // Summary kinh nghiệm
kyNangMem: String[]                 // Soft skills
baiVietKyThuat: Embedded[]         // Technical articles
fileCvLoai: String                  // Loại file (PDF, DOCX)
fileCvPath: String                  // Đường dẫn file
fileCvTextStatus: Enum              // Trạng thái trích xuất text
anhDaiDien: String                  // Avatar trong CV
templateCv: String                  // Template CV builder
mauChinh: String                    // Màu chính template
mauPhu: String                      // Màu phụ template
font: String                        // Font chữ
markdownGoc: String                 // Markdown gốc (nếu builder)
ghiChuAi: String                    // Ghi chú từ AI phân tích
ngayTao: Date
ngayCapNhat: Date
```

**Cần bổ sung vào ERD:** ~18 trường

---

### 3.4. **thong_bao** - Có khác biệt

#### Hệ thống có THÊM:

```typescript
// ⚠️ CÁC TRƯỜNG BỔ SUNG:
daGui: Boolean                      // Đã gửi qua email/push
hanhDong: Embedded[]               // Các nút hành động
  [{
    nhan: String,
    url: String,
    loai: String  // 'primary', 'secondary', 'danger'
  }]
icon: String                        // Icon thông báo
mauSac: String                      // Màu hiển thị

// Index đặc biệt:
index: { hetHan: 1 }, { expireAfterSeconds: 0 }  // TTL index tự xóa
```

---

## PHẦN 4: CÁC BẢNG MỚI CẦN BỔ SUNG VÀO ERD

### 4.1. ✅ **viec_lam_da_luu** (QUAN TRỌNG)

```typescript
Collection: viec_lam_da_luu
{
  _id: ObjectId (PK)
  maNguoiDung: ObjectId (FK → nguoi_dung, required, index)
  maTinTuyenDung: ObjectId (FK → tin_tuyen_dung, required, index)
  ngayLuu: Date (default: now)
  ngayTao: Date
  ngayCapNhat: Date
  
  // UNIQUE INDEX
  UNIQUE(maNguoiDung, maTinTuyenDung)
}
```

**Mối quan hệ:**
- NguoiDung (1) → (n) ViecLamDaLuu
- TinTuyenDung (1) → (n) ViecLamDaLuu

**Use case:** Ứng viên lưu tin yêu thích để xem sau

---

### 4.2. ✅ **lich_su_ho_so_ung_tuyen** (QUAN TRỌNG)

```typescript
Collection: lich_su_ho_so_ung_tuyen
{
  _id: ObjectId (PK)
  maHoSoUngTuyen: ObjectId (FK → ho_so_ung_tuyen, required)
  trangThaiCu: Enum ['da_nop', 'da_xem', ...] (nullable)
  trangThaiMoi: Enum ['da_nop', 'da_xem', 'dang_xet_duyet', 
                      'moi_phong_van', 'dat', 'tu_choi', 'da_rut']
  ghiChu: String
  maNguoiDung: ObjectId (FK → nguoi_dung)  // Người thực hiện
  thoiGian: Date (default: now)
  ngayTao: Date
  ngayCapNhat: Date
}
```

**Mối quan hệ:**
- HoSoUngTuyen (1) → (n) LichSuHoSoUngTuyen
- NguoiDung (1) → (n) LichSuHoSoUngTuyen

**Use case:** Audit trail - Ghi lại lịch sử thay đổi trạng thái hồ sơ

---

### 4.3. ✅ **cuoc_tro_chuyen** (CHAT SYSTEM - QUAN TRỌNG)

```typescript
Collection: cuoc_tro_chuyen
{
  _id: ObjectId (PK)
  
  // Participants
  nguoiThamGia: ObjectId[] (FK → nguoi_dung, required)
  
  // Type
  loai: Enum ['ung_vien_nha_tuyen_dung', 'admin_support', 
              'nhom_cong_dong']
  
  // Group info (for 'nhom_cong_dong')
  tenNhom: String
  moTaNhom: String
  anhNhom: String
  quanTriNhom: ObjectId[] (FK → nguoi_dung)
  
  // Context (for recruitment chat)
  maHoSoUngTuyen: ObjectId (FK → ho_so_ung_tuyen)
  maTinTuyenDung: ObjectId (FK → tin_tuyen_dung)
  maHoSoUngTuyenGanNhat: ObjectId (FK)
  maTinTuyenDungGanNhat: ObjectId (FK)
  contextSummary: {
    tieuDeTin: String,
    tenCongTy: String,
    maHoSoUngTuyen: String,
    maTinTuyenDung: String,
    capNhatLuc: Date
  }
  
  // Last message preview
  tinNhanCuoiCung: {
    noiDung: String,
    nguoiGui: ObjectId (FK → nguoi_dung),
    thoiGian: Date
  }
  
  // Unread counts
  soChuaDoc: Map<ObjectId, Number>  // { userId: unreadCount }
  
  // Archive
  daLuuTru: Boolean (default: false)
  thoiGianLuuTru: Date
  
  ngayTao: Date
  ngayCapNhat: Date
  
  // INDEXES
  index: { nguoiThamGia: 1, ngayCapNhat: -1 }
  index: { nguoiThamGia: 1, loai: 1, daLuuTru: 1 }
  index: { maHoSoUngTuyen: 1 }
  index: { daLuuTru: 1 }
}
```

**Mối quan hệ:**
- NguoiDung (n) ↔ (n) CuocTroChuyenModel (many-to-many)
- HoSoUngTuyen (1) → (n) CuocTroChuyenModel
- TinTuyenDung (1) → (n) CuocTroChuyenModel

---

### 4.4. ✅ **tin_nhan** (MESSAGES - QUAN TRỌNG)

```typescript
Collection: tin_nhan
{
  _id: ObjectId (PK)
  
  // Conversation
  maCuocTroChuyenId: ObjectId (FK → cuoc_tro_chuyen, required, index)
  
  // Sender
  nguoiGui: ObjectId (FK → nguoi_dung, required)
  
  // Content
  loai: Enum ['text', 'file', 'image', 'system']
  noiDung: String (required)
  
  // Attachments
  tepDinhKem: [{
    tenFile: String,
    duongDan: String,
    kichThuoc: Number,
    loaiFile: String
  }]
  
  // Reply
  traloiTinNhan: ObjectId (FK → tin_nhan)  // Self-reference
  
  // Read receipts
  daDuocDocBoi: [{
    nguoiDung: ObjectId (FK → nguoi_dung),
    thoiGian: Date
  }]
  
  // Reactions
  phanUng: [{
    nguoiDung: ObjectId (FK → nguoi_dung),
    emoji: String
  }]
  
  // Status
  daXoa: Boolean (default: false)
  daChinhSua: Boolean (default: false)
  thoiGianChinhSua: Date
  
  ngayTao: Date
  ngayCapNhat: Date
  
  // INDEXES
  index: { maCuocTroChuyenId: 1, ngayTao: -1 }
  index: { nguoiGui: 1 }
  index: { daXoa: 1 }
}
```

**Mối quan hệ:**
- CuocTroChuyenModel (1) → (n) TinNhanModel
- NguoiDung (1) → (n) TinNhanModel
- TinNhanModel (1) → (n) TinNhanModel (reply to message)

---

### 4.5. ✅ **goi_y_viec_lam** (AI RECOMMENDATION)

```typescript
Collection: goi_y_viec_lam
{
  _id: ObjectId (PK)
  maUngVien: ObjectId (FK → ung_vien, required, index)
  maHoSoNangLuc: ObjectId (FK → ho_so_nang_luc)
  
  // Results embedded
  ketQua: [{
    maTinTuyenDung: ObjectId (FK → tin_tuyen_dung, required),
    diem: Number (default: 0),
    lyDo: String,
    kyNangKhop: String[],
    kyNangThieu: String[]
  }]
  
  trangThai: Enum ['dang_chay', 'hoan_thanh', 'loi']
  loi: String
  nguon: String (default: 'gemini')  // AI model
  lanQuet: Date (default: now)
  
  ngayTao: Date
  ngayCapNhat: Date
  
  // INDEX
  index: { maUngVien: 1, lanQuet: -1 }
}
```

**Mối quan hệ:**
- UngVien (1) → (n) GoiYViecLam
- HoSoNangLuc (1) → (n) GoiYViecLam
- GoiYViecLam → (n) TinTuyenDung (embedded trong ketQua[])

---

## PHẦN 5: TÓM TẮT KHÁC BIỆT

### 5.1. Thống kê

| Loại | Số lượng | Mô tả |
|------|----------|-------|
| **Bảng trong ERD thiết kế** | ~10 | Bảng cơ bản |
| **Bảng trong hệ thống** | 15 | Bao gồm chat, AI |
| **Bảng CẦN BỔ SUNG** | 5 | viec_lam_da_luu, lich_su, cuoc_tro_chuyen, tin_nhan, goi_y_viec_lam |
| **Trường cần bổ sung** | ~30+ | Phân tán trong các bảng |

### 5.2. Mức độ ưu tiên bổ sung

| Ưu tiên | Bảng/Trường | Lý do |
|---------|-------------|-------|
| **CAO** | viec_lam_da_luu | Use case cơ bản: Lưu việc yêu thích |
| **CAO** | lich_su_ho_so_ung_tuyen | Audit trail quan trọng |
| **CAO** | cuoc_tro_chuyen, tin_nhan | Tính năng Chat UV-NTD |
| **TRUNG BÌNH** | goi_y_viec_lam | Tính năng AI nâng cao |
| **TRUNG BÌNH** | nha_tuyen_dung.trangThaiDuyet | Quy trình duyệt công ty |
| **THẤP** | ho_so_nang_luc (các trường UI) | Trường phụ trợ (màu sắc, font, template) |

---

## PHẦN 6: KHUYẾN NGHỊ BỔ SUNG ERD

### Bước 1: Thêm 5 bảng mới

1. **viec_lam_da_luu** - Quan hệ n-n giữa NguoiDung và TinTuyenDung
2. **lich_su_ho_so_ung_tuyen** - Log audit
3. **cuoc_tro_chuyen** - Chat conversation
4. **tin_nhan** - Messages
5. **goi_y_viec_lam** - AI recommendations

### Bước 2: Bổ sung trường vào các bảng có sẵn

**nha_tuyen_dung:**
- `maSoThue: String`
- `trangThaiDuyet: Enum`
- `lyDoTuChoi: String`
- `ngayDuyet: Date`

**ho_so_nang_luc:**
- `facebook, github, portfolioUrl: String`
- `diaDiem: String`
- `tomTatKinhNghiem: String[]`
- `kyNangMem: String[]`
- `baiVietKyThuat: Embedded[]`
- `fileCvLoai, fileCvPath, fileCvTextStatus: String/Enum`
- `anhDaiDien, templateCv, mauChinh, mauPhu, font: String`
- `markdownGoc, ghiChuAi: String`

**thong_bao:**
- `daGui: Boolean`
- `hanhDong: Embedded[]`
- `icon, mauSac: String`

### Bước 3: Cập nhật quan hệ ERD

```
// Quan hệ mới
NguoiDung (1) → (n) ViecLamDaLuu
TinTuyenDung (1) → (n) ViecLamDaLuu

HoSoUngTuyen (1) → (n) LichSuHoSoUngTuyen
NguoiDung (1) → (n) LichSuHoSoUngTuyen

NguoiDung (n) ↔ (n) CuocTroChuyenModel
HoSoUngTuyen (1) → (n) CuocTroChuyenModel
TinTuyenDung (1) → (n) CuocTroChuyenModel

CuocTroChuyenModel (1) → (n) TinNhanModel
NguoiDung (1) → (n) TinNhanModel
TinNhanModel (1) → (n) TinNhanModel (reply)

UngVien (1) → (n) GoiYViecLam
HoSoNangLuc (1) → (n) GoiYViecLam
```

---

## KẾT LUẬN

**ERD hiện tại** đã có cấu trúc CƠ BẢN tốt nhưng **THIẾU 5 bảng quan trọng** và **~30+ trường** cần thiết cho hệ thống hoàn chỉnh.

**Các tính năng THIẾU trong ERD:**
1. ❌ Lưu việc làm yêu thích
2. ❌ Lịch sử thay đổi trạng thái hồ sơ (audit)
3. ❌ Chat real-time UV ↔ NTD
4. ❌ AI gợi ý việc làm
5. ⚠️ Quy trình duyệt công ty (thiếu trường trangThaiDuyet)

**Cần bổ sung ngay** để ERD phản ánh đúng hệ thống thực tế.

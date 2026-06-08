# HƯỚNG DẪN KIỂU DỮ LIỆU CHO ẢNH/FILE TRONG ERD

---

## PHẦN 1: PHƯƠNG PHÁP LƯU TRỮ ẢNH

### **Hệ thống của bạn đang dùng: String (URL/Path) ✅**

```typescript
anhDaiDien: String  // MongoDB/Mongoose
```

Validation:
```typescript
anhDaiDien: z.string().url('Ảnh đại diện phải là URL hợp lệ').optional()
```

---

## CÁC PHƯƠNG PHÁP LƯU TRỮ ẢNH PHỔ BIẾN

### **1. String (URL/Path) - ĐANG DÙNG ⭐ KHUYẾN NGHỊ**

**Cách hoạt động:**
- Lưu **đường dẫn** hoặc **URL** của ảnh dưới dạng chuỗi
- Ảnh thật được lưu trên:
  - Local server: `/uploads/avatars/user123.jpg`
  - CDN: `https://cdn.example.com/avatars/user123.jpg`
  - Cloud: `https://storage.googleapis.com/bucket/user123.jpg`

**Trong ERD:**
```
anhDaiDien : String
logo : String
anhDaiDien : String (URL)
```

**Ví dụ dữ liệu:**
```json
{
  "anhDaiDien": "https://cdn.effortit.com/avatars/user_123_1234567890.jpg"
}
```

**Ưu điểm:**
- ✅ Tiết kiệm dung lượng database
- ✅ Tốc độ query nhanh
- ✅ Dễ scale (dùng CDN)
- ✅ Dễ backup và migrate
- ✅ Có thể cache ảnh ở nhiều tầng

**Nhược điểm:**
- ❌ Cần quản lý file riêng biệt
- ❌ Có thể bị broken link nếu xóa file

**Khi nào dùng:**
- ✅ Hầu hết các trường hợp (KHUYẾN NGHỊ)
- ✅ Ứng dụng production
- ✅ Hệ thống lớn

---

### **2. Base64 String**

**Cách hoạt động:**
- Mã hóa ảnh thành chuỗi Base64
- Lưu trực tiếp trong database

**Trong ERD:**
```
anhDaiDien : String (Base64)
anhDaiDien : Text
```

**Ví dụ dữ liệu:**
```json
{
  "anhDaiDien": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Ưu điểm:**
- ✅ Không cần lưu file riêng
- ✅ Dữ liệu và ảnh ở cùng 1 nơi
- ✅ Dễ backup (chỉ backup DB)

**Nhược điểm:**
- ❌ Tăng kích thước DB ~33%
- ❌ Query chậm hơn
- ❌ Không thể cache bằng CDN
- ❌ Không optimize được image (resize, compress)
- ❌ Khó scale

**Khi nào dùng:**
- ⚠️ Ảnh nhỏ (<50KB): icon, thumbnail nhỏ
- ⚠️ Prototype/Demo nhanh
- ❌ KHÔNG dùng cho production lớn

---

### **3. Binary (Buffer/Blob) - Lưu nhị phân**

**Cách hoạt động:**
- Lưu dữ liệu nhị phân trực tiếp trong DB

**Trong ERD (SQL):**
```
anhDaiDien : BLOB
anhDaiDien : VARBINARY(MAX)
anhDaiDien : BYTEA
```

**Trong ERD (MongoDB):**
```
anhDaiDien : Buffer
anhDaiDien : BinData
```

**Ví dụ Mongoose:**
```typescript
anhDaiDien: { type: Buffer }
```

**Ưu điểm:**
- ✅ Dữ liệu tập trung
- ✅ Transaction safety (ACID)

**Nhược điểm:**
- ❌ Cực kỳ chậm với ảnh lớn
- ❌ Tăng kích thước DB khổng lồ
- ❌ Backup lâu
- ❌ Không thể dùng CDN
- ❌ Không tối ưu

**Khi nào dùng:**
- ⚠️ Chỉ khi BẮT BUỘC (yêu cầu bảo mật cực cao)
- ❌ KHÔNG khuyến nghị cho web app

---

### **4. GridFS (MongoDB) - Cho file lớn**

**Cách hoạt động:**
- MongoDB chia file thành chunks
- Lưu vào 2 collections: `fs.files` và `fs.chunks`

**Trong ERD:**
```
anhDaiDien : ObjectId (ref: GridFS)
anhDaiDien : GridFS
```

**Ưu điểm:**
- ✅ Lưu file lớn (>16MB)
- ✅ Streaming support
- ✅ Metadata management

**Nhược điểm:**
- ❌ Phức tạp
- ❌ Chậm hơn file system
- ❌ Không thể dùng CDN

**Khi nào dùng:**
- File PDF lớn
- Video nhỏ
- File binary cần version control

---

## PHẦN 2: KHUYẾN NGHỊ CHO HỆ THỐNG CỦA BẠN

### ✅ **ĐANG DÙNG ĐÚNG: String (URL/Path)**

**Kiểu dữ liệu trong ERD:**

#### **Cách 1: Đơn giản (KHUYẾN NGHỊ)** ⭐
```
anhDaiDien : String
logo : String
fileCvPath : String
```

#### **Cách 2: Chi tiết hơn**
```
anhDaiDien : String (URL)
logo : String (Path)
fileCvData : String (Base64) // Nếu dùng base64
```

#### **Cách 3: Rõ ràng nhất**
```
anhDaiDien : String
  // Lưu URL hoặc path: /uploads/avatars/user123.jpg
  // Format: JPEG, PNG, WebP
  // Max size: 5MB
```

---

## PHẦN 3: TẤT CẢ TRƯỜNG LIÊN QUAN ẢNH/FILE TRONG HỆ THỐNG

### **3.1. Trường lưu URL/Path (String) ✅**

| Bảng | Trường | Kiểu ERD | Mô tả |
|------|--------|----------|-------|
| **ung_vien** | `anhDaiDien` | String | Avatar ứng viên |
| **nha_tuyen_dung** | `logo` | String | Logo công ty |
| **tin_tuyen_dung** | `anhDaiDien` | String | Banner tin tuyển dụng |
| **ho_so_nang_luc** | `anhDaiDien` | String | Avatar trong CV |
| **ho_so_nang_luc** | `fileCvPath` | String | Đường dẫn file CV |
| **cuoc_tro_chuyen** | `anhNhom` | String | Avatar nhóm chat |

### **3.2. Trường lưu Base64/Binary (String/Buffer) ⚠️**

| Bảng | Trường | Kiểu ERD | Mô tả |
|------|--------|----------|-------|
| **ho_so_nang_luc** | `fileCvData` | String | Base64 hoặc binary data của CV |
| **tin_nhan** | `tepDinhKem[].duongDan` | String | Path file đính kèm chat |

### **3.3. Metadata file (String)**

| Bảng | Trường | Kiểu ERD | Mô tả |
|------|--------|----------|-------|
| **ho_so_nang_luc** | `fileCvTen` | String | Tên file CV (ví dụ: "CV_NguyenVanA.pdf") |
| **ho_so_nang_luc** | `fileCvLoai` | String | MIME type (ví dụ: "application/pdf") |
| **tin_nhan** | `tepDinhKem[].tenFile` | String | Tên file gốc |
| **tin_nhan** | `tepDinhKem[].loaiFile` | String | MIME type |
| **tin_nhan** | `tepDinhKem[].kichThuoc` | Number | Kích thước (bytes) |

---

## PHẦN 4: VÍ DỤ TRONG ERD HOÀN CHỈNH

### **Ví dụ 1: Bảng ung_vien**

```plantuml
entity "ung_vien" as UngVien {
  * _id : ObjectId <<PK>>
  --
  maNguoiDung : ObjectId <<FK, UNIQUE>>
  ngaySinh : Date
  gioiTinh : Enum ['nam', 'nu', 'khac']
  diaChi : String
  anhDaiDien : String
    // URL hoặc path: /uploads/avatars/user123.jpg
    // Supported: JPEG, PNG, WebP
    // Max: 5MB
  tomTat : String
  kinhNghiem : Number
  ngayTao : Date
  ngayCapNhat : Date
}
```

### **Ví dụ 2: Bảng ho_so_nang_luc (File CV)**

```plantuml
entity "ho_so_nang_luc" as HoSoNangLuc {
  * _id : ObjectId <<PK>>
  --
  maUngVien : ObjectId <<FK>>
  tieuDe : String
  
  // File CV fields
  fileCvTen : String
    // Tên file gốc: "CV_NguyenVanA.pdf"
  fileCvLoai : String
    // MIME type: "application/pdf"
  fileCvPath : String
    // Path lưu trữ: "/uploads/cv/user123_cv.pdf"
  fileCvData : String
    // Base64 data (optional, for backup)
  fileCvText : String
    // Text extracted for AI
  
  // Avatar in CV
  anhDaiDien : String
    // Avatar URL trong CV builder
  
  loaiHoSo : Enum ['builder', 'file_upload']
  ngayTao : Date
  ngayCapNhat : Date
}
```

### **Ví dụ 3: Bảng tin_nhan (Chat attachments)**

```plantuml
entity "tin_nhan" as TinNhan {
  * _id : ObjectId <<PK>>
  --
  maCuocTroChuyenId : ObjectId <<FK>>
  nguoiGui : ObjectId <<FK>>
  loai : Enum ['text', 'file', 'image', 'system']
  noiDung : String
  
  // File attachments (embedded)
  tepDinhKem : Array [{
    tenFile : String,      // "document.pdf"
    duongDan : String,     // "/uploads/chat/file123.pdf"
    kichThuoc : Number,    // 2048000 (bytes)
    loaiFile : String      // "application/pdf"
  }]
  
  ngayTao : Date
}
```

---

## PHẦN 5: BẢNG MÔ TẢ DỮ LIỆU (CHI TIẾT)

### **Bảng 5.1: ung_vien**

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả | Format/Ví dụ |
|------------|--------------|-----------|-------|--------------|
| `anhDaiDien` | String | Optional | URL hoặc path avatar | `https://cdn.effortit.com/avatars/user_123.jpg` hoặc `/uploads/avatars/user_123.jpg` |

### **Bảng 5.2: ho_so_nang_luc**

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả | Format/Ví dụ |
|------------|--------------|-----------|-------|--------------|
| `fileCvTen` | String | Optional | Tên file CV gốc | `CV_NguyenVanA_2024.pdf` |
| `fileCvLoai` | String | Optional | MIME type | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `fileCvPath` | String | Optional | Đường dẫn file trên server | `/uploads/cv/user_123_1234567890.pdf` |
| `fileCvData` | String | Optional | Base64 encoded (backup) | `JVBERi0xLjcKCjEgMCBvYm...` (rất dài) |
| `fileCvText` | String | Optional | Text trích xuất (cho AI) | `Họ tên: Nguyễn Văn A\nKinh nghiệm: 3 năm...` |
| `anhDaiDien` | String | Optional | Avatar trong CV builder | `https://cdn.effortit.com/cv-avatars/user_123.jpg` |

---

## PHẦN 6: KIẾN TRÚC LƯU TRỮ FILE THỰC TẾ

```
┌─────────────────────────────────────────┐
│         Frontend Upload                 │
│  FormData với file (multipart)          │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Backend API (Express/Multer)       │
│  - Validate file (type, size)           │
│  - Generate unique filename             │
│  - Save to: /uploads/avatars/           │
│  - Return: URL/path                     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         MongoDB Database                │
│  anhDaiDien: "/uploads/avatars/xxx.jpg" │
│  (Chỉ lưu STRING path, không lưu file)  │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      File System / CDN / Cloud          │
│  /var/www/effortit/uploads/avatars/     │
│  └── user_123_1234567890.jpg            │
│  hoặc: CloudFlare, AWS S3, Google Cloud │
└─────────────────────────────────────────┘
```

---

## KẾT LUẬN

### ✅ **Cho hệ thống của bạn (MongoDB/Mongoose):**

**Kiểu dữ liệu trong ERD:**
```
anhDaiDien : String
logo : String
fileCvPath : String
fileCvData : String
fileCvTen : String
fileCvLoai : String
```

**KHÔNG dùng:**
```
❌ anhDaiDien : BLOB
❌ anhDaiDien : VARBINARY
❌ anhDaiDien : IMAGE
❌ anhDaiDien : Buffer (trừ trường hợp đặc biệt)
```

**Lý do:**
- String (URL/Path) là phương pháp TỐT NHẤT cho web app
- Dễ scale, dễ optimize, dễ backup
- Performance tốt nhất
- Có thể dùng CDN để tăng tốc độ

### 📝 **Ghi chú trong ERD:**

Nên thêm comment để rõ ràng:
```
anhDaiDien : String
  // Lưu URL hoặc path
  // VD: /uploads/avatars/user123.jpg
  // Supported: JPEG, PNG, WebP | Max: 5MB
```

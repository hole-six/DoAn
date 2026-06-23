# Module Đánh Giá Công Ty — Tài liệu kỹ thuật chi tiết

## Mục lục
1. [Tổng quan](#1-tổng-quan)
2. [Cấu trúc file](#2-cấu-trúc-file)
3. [Database Schema](#3-database-schema)
4. [Các API Endpoint](#4-các-api-endpoint)
5. [Luồng nghiệp vụ chi tiết](#5-luồng-nghiệp-vụ-chi-tiết)
6. [Validation (Kiểm tra dữ liệu)](#6-validation-kiểm-tra-dữ-liệu)
7. [Kiến trúc nội bộ — từng layer](#7-kiến-trúc-nội-bộ--từng-layer)
8. [Các hàm helper nội bộ](#8-các-hàm-helper-nội-bộ)
9. [Các lỗi có thể xảy ra](#9-các-lỗi-có-thể-xảy-ra)
10. [Quy tắc nghiệp vụ](#10-quy-tắc-nghiệp-vụ)

---

## 1. Tổng quan

Module **Đánh Giá Công Ty** cho phép ứng viên đánh giá công ty (NTD) sau khi hoàn tất phỏng vấn. Admin có quyền duyệt/xóa/sửa đánh giá. Công khai — ai cũng xem được danh sách đánh giá đã duyệt.

**Ai làm gì:**
| Vai trò | Quyền |
|---|---|
| Khách vãng lai | Xem danh sách, xem chi tiết 1 đánh giá |
| Ứng viên | Xem đánh giá của mình, tạo đánh giá từ hồ sơ ứng tuyển |
| Admin | Tạo thô, cập nhật (duyệt), xóa |

---

## 2. Cấu trúc file

```
backend/src/modules/danhgiacongty/
├── danhgiacongty.mohinh.ts     → Kết nối Prisma model
├── danhgiacongty.kiemtra.ts    → Schema validation (Zod)
├── danhgiacongty.dichvu.ts     → Business logic (xử lý nghiệp vụ)
├── danhgiacongty.dieukhien.ts  → Controller (nhận request, gọi service)
└── danhgiacongty.dinhtuyen.ts  → Router (định nghĩa các route API)
```

**Luồng dữ liệu tổng quát:**
```
HTTP Request
    ↓
dinhtuyen.ts  (định nghĩa route, gán middleware)
    ↓
xacthuc middleware  (kiểm tra token, vai trò)
    ↓
kiemtra.ts  (validate body bằng Zod)
    ↓
dieukhien.ts  (nhận request, gọi service)
    ↓
dichvu.ts  (logic nghiệp vụ, query DB)
    ↓
Database (PostgreSQL qua Prisma)
    ↓
HTTP Response (JSON chuẩn hóa)
```

---

## 3. Database Schema

**Bảng: `danh_gia_cong_ty`**

```prisma
model DanhGiaCongTy {
  id             String        @id @default(uuid())
  maUngVien      String                        -- FK → ung_vien.id
  maNhaTuyenDung String                        -- FK → nha_tuyen_dung.id
  maHoSoUngTuyen String?       @unique         -- FK → ho_so_ung_tuyen.id (nullable, unique)
  diem           Int                           -- 1 đến 5 sao
  noiDung        String                        -- Nội dung đánh giá (min 10 ký tự)
  anDanh         Boolean       @default(false) -- Ẩn danh hay không
  daDuyet        Boolean       @default(false) -- Admin chưa duyệt = false
  ngayTao        DateTime      @default(now())
  ngayCapNhat    DateTime      @updatedAt

  -- Quan hệ
  ungVien        UngVien       @relation(...)  -- onDelete: Cascade
  nhaTuyenDung   NhaTuyenDung  @relation(...)  -- onDelete: Cascade
  hoSoUngTuyen   HoSoUngTuyen? @relation(...)  -- onDelete: SetNull

  -- Index để tăng tốc query
  @@index([maNhaTuyenDung])   -- tìm theo công ty
  @@index([maUngVien])        -- tìm theo ứng viên
  @@index([daDuyet])          -- lọc đã duyệt / chưa duyệt
  @@index([ngayTao])          -- sắp xếp theo ngày
}
```

**Điểm quan trọng:**
- `maHoSoUngTuyen` là **unique** → 1 hồ sơ ứng tuyển chỉ được đánh giá đúng 1 lần, không thể tạo lại
- `maHoSoUngTuyen` là **nullable** (có dấu `?`) → admin có thể tạo đánh giá không gắn với hồ sơ cụ thể
- `onDelete: Cascade` trên UngVien và NhaTuyenDung → khi xóa ứng viên hoặc công ty, toàn bộ đánh giá liên quan bị xóa theo
- `onDelete: SetNull` trên HoSoUngTuyen → khi xóa hồ sơ ứng tuyển, đánh giá vẫn tồn tại, chỉ `maHoSoUngTuyen` bị set thành `null`

---

## 4. Các API Endpoint

**Base path:** `/danhgiacongty` (xem `apitong.ts`)

| Method | Endpoint | Auth | Vai trò | Mô tả |
|---|---|---|---|---|
| GET | `/` | Không cần | Tất cả | Lấy danh sách tất cả đánh giá |
| GET | `/toi` | Bắt buộc | ung_vien | Lấy đánh giá của ứng viên đang đăng nhập |
| POST | `/tu-ho-so/:maHoSoUngTuyen` | Bắt buộc | ung_vien | Tạo đánh giá từ hồ sơ ứng tuyển |
| GET | `/:ma` | Không cần | Tất cả | Xem chi tiết 1 đánh giá |
| POST | `/` | Bắt buộc | admin | Tạo đánh giá thô (admin) |
| PATCH | `/:ma` | Bắt buộc | admin | Cập nhật đánh giá (duyệt/sửa) |
| DELETE | `/:ma` | Bắt buộc | admin | Xóa đánh giá |

---

## 5. Luồng nghiệp vụ chi tiết

### 5.1 Ứng viên tạo đánh giá — `POST /tu-ho-so/:maHoSoUngTuyen`

Đây là luồng quan trọng nhất, có nhiều bước kiểm tra nhất:

```
Ứng viên gửi request
    │
    ├─ [1] Middleware: yeuCauDangNhap
    │       → Xác thực token JWT
    │       → Nếu không có token → 401 Unauthorized
    │
    ├─ [2] Middleware: yeuCauVaiTro(['ung_vien'])
    │       → Kiểm tra vaiTro = 'ung_vien'
    │       → Nếu là NTD hoặc admin → 403 Forbidden
    │
    ├─ [3] Validation: kiemTraUngVienTaoDanhGiaCongTy.parse(body)
    │       → diem: số nguyên 1-5
    │       → noiDung: tối thiểu 10 ký tự
    │       → anDanh: boolean (optional)
    │       → Nếu sai → 422 Validation Error
    │
    ├─ [4] Service: layUngVienCuaNguoiDung(nguoiDung)
    │       → Kiểm tra vaiTro = 'ung_vien' (lần 2, ở service level)
    │       → Tìm UngVien theo maNguoiDung
    │       → Nếu chưa tạo profile ứng viên → 422 CANDIDATE_PROFILE_REQUIRED
    │
    ├─ [5] Service: layHoSoUngTuyenDayDuNoiBo(maHoSoUngTuyen)
    │       → Lấy hồ sơ ứng tuyển kèm tin tuyển dụng và công ty
    │       → Nếu không tìm thấy → 404 APPLICATION_NOT_FOUND
    │
    ├─ [6] Kiểm tra quyền sở hữu hồ sơ
    │       → id(hoSo.maUngVien) phải === id(ungVien)
    │       → Nếu là hồ sơ người khác → 403 FORBIDDEN
    │
    ├─ [7] damBaoDaCoKetQuaPhongVan(hoSo)
    │       → Tìm LichPhongVan: maHoSoUngTuyen khớp + trangThai='hoan_thanh' + ketQua IN ['dat','khong_dat']
    │       → Nếu chưa có kết quả phỏng vấn → 409 REVIEW_REQUIRES_INTERVIEW_RESULT
    │
    ├─ [8] Lấy maNhaTuyenDung từ hồ sơ
    │       → hoSo.maTinTuyenDung?.maNhaTuyenDung
    │       → Nếu không tìm thấy công ty → 404 COMPANY_NOT_FOUND
    │
    ├─ [9] Kiểm tra đã đánh giá chưa
    │       → DanhGiaCongTy.findFirst({ where: { maHoSoUngTuyen } })
    │       → Nếu đã tồn tại → 409 REVIEW_ALREADY_EXISTS
    │
    ├─ [10] Tạo bản ghi DanhGiaCongTy
    │        → maUngVien, maNhaTuyenDung, maHoSoUngTuyen
    │        → diem, noiDung từ body
    │        → anDanh = body.anDanh ?? false
    │        → daDuyet = false  ← luôn false, phải chờ admin duyệt
    │
    └─ [11] Query lại → hydrate → chuanHoa → trả 201 Created
```

### 5.2 Xem danh sách — `GET /`

```
Request đến (không cần auth)
    │
    ├─ layDanhGiaDayDu({}, many=true)
    │   ├─ DanhGiaCongTy.findMany({ orderBy: ngayTao desc, take: 300 })
    │   └─ hydrate(rows)
    │       ├─ Promise.all([query UngVien, query NhaTuyenDung, query HoSoUngTuyen])
    │       ├─ ganNguoiDungChoUngVien(ungVienRows)  ← join thêm NguoiDung
    │       └─ Map ID → object đầy đủ cho từng quan hệ
    │
    ├─ chuanHoaDanhGia(item) cho từng bản ghi
    │
    └─ Trả về mảng JSON (tất cả đánh giá, kể cả chưa duyệt)
```

> **Lưu ý:** Hiện tại không lọc `daDuyet = true` — admin xem được cả chưa duyệt. Nếu muốn public chỉ thấy đã duyệt, cần thêm điều kiện lọc ở frontend hoặc thêm query param.

### 5.3 Ứng viên xem đánh giá của mình — `GET /toi`

```
Token → xác thực → lấy nguoiDung từ request
    │
    ├─ layUngVienCuaNguoiDung(nguoiDung)  ← kiểm tra vai trò + lấy UngVien
    │
    ├─ layDanhGiaDayDu({ maUngVien: id(ungVien) }, many=true)
    │   → Lọc theo đúng ứng viên đang đăng nhập
    │
    └─ Trả về danh sách đánh giá của riêng ứng viên đó
```

### 5.4 Admin duyệt đánh giá — `PATCH /:ma`

```
Admin gửi body: { daDuyet: true }
    │
    ├─ Kiểm tra tồn tại (findUnique)
    │
    ├─ DanhGiaCongTy.update({ daDuyet: true })
    │
    └─ Query lại → trả về đánh giá đã cập nhật
```

### 5.5 Admin xóa đánh giá — `DELETE /:ma`

```
Admin gửi DELETE /:ma
    │
    ├─ layDanhGiaDayDu({ id: ma })  ← lấy data đầy đủ TRƯỚC khi xóa
    │
    ├─ DanhGiaCongTy.delete({ id: ma })
    │
    └─ Trả về object vừa xóa (để frontend biết cái gì đã bị xóa)
```

---

## 6. Validation (Kiểm tra dữ liệu)

### `kiemTraTaoDanhGiaCongTy` — Dành cho admin tạo thô

```typescript
{
  maUngVien:      string (min 1)           // bắt buộc
  maNhaTuyenDung: string (min 1)           // bắt buộc
  maHoSoUngTuyen: string (min 1) | bỏ qua // optional
  diem:           số nguyên 1–5            // bắt buộc
  noiDung:        string (min 3)           // bắt buộc
  anDanh:         boolean                  // optional
  daDuyet:        boolean                  // optional
}
```

### `kiemTraUngVienTaoDanhGiaCongTy` — Dành cho ứng viên tạo từ hồ sơ

```typescript
{
  diem:    số nguyên 1–5             // bắt buộc, 1 sao đến 5 sao
  noiDung: string (trim, min 10)     // bắt buộc, tối thiểu 10 ký tự
  anDanh:  boolean                   // optional, mặc định false
}
```
> Ứng viên **không** truyền `maUngVien`, `maNhaTuyenDung` — hệ thống tự lấy từ hồ sơ ứng tuyển để tránh giả mạo.

### `kiemTraCapNhatDanhGiaCongTy` — Dành cho admin cập nhật

```typescript
// Toàn bộ field của kiemTraTaoDanhGiaCongTy nhưng đều optional (.partial())
// Admin có thể patch từng field riêng lẻ
```

---

## 7. Kiến trúc nội bộ — từng layer

### Layer 1: `danhgiacongty.mohinh.ts`

```typescript
export const DanhGiaCongTy = prisma.danhGiaCongTy
```
Chỉ export Prisma delegate. Mục đích: tập trung truy cập DB qua một điểm, dễ mock khi test.

### Layer 2: `danhgiacongty.kiemtra.ts`

Dùng thư viện **Zod** để validate. Khi `.parse()` thất bại → throw `ZodError` → middleware `xuLyLoi` bắt → trả 422 với danh sách lỗi từng field.

### Layer 3: `danhgiacongty.dieukhien.ts`

```typescript
export const dieuKhienDanhGiaCongTy = taoDieuKhienCoBan(
  dichVuDanhGiaCongTy,
  kiemTraTaoDanhGiaCongTy,
  kiemTraCapNhatDanhGiaCongTy,
)
```
Dùng factory `taoDieuKhienCoBan` để tạo ra 5 handler chuẩn (layDanhSach, layChiTiet, taoMoi, capNhat, xoa). Không viết tay — tránh lặp code.

### Layer 4: `danhgiacongty.dichvu.ts`

Toàn bộ logic nghiệp vụ nằm ở đây. Controller không biết gì về DB, chỉ gọi service.

### Layer 5: `danhgiacongty.dinhtuyen.ts`

Định nghĩa route và gán middleware. Là nơi duy nhất biết "endpoint nào cần auth gì".

---

## 8. Các hàm helper nội bộ

### `id(value)`

```typescript
function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}
```
Trích xuất ID dạng string từ bất kỳ kiểu nào — object có `_id`, object có `id`, hoặc string thuần. Cần thiết vì sau khi hydrate, một số field là object, một số vẫn là string.

---

### `hydrate(rows)`

**Vấn đề:** DB chỉ lưu ID (maUngVien, maNhaTuyenDung, maHoSoUngTuyen), không lưu object đầy đủ. Frontend cần tên ứng viên, tên công ty...

**Giải pháp:** Batch query 3 bảng song song rồi ghép vào:

```
Input:  [{ id, maUngVien: "abc", maNhaTuyenDung: "xyz", ... }, ...]
            ↓
Promise.all([
  prisma.ungVien.findMany({ id IN [...tất cả maUngVien] }),     ← 1 query
  prisma.nhaTuyenDung.findMany({ id IN [...tất cả maNhaTuyenDung] }), ← 1 query
  prisma.hoSoUngTuyen.findMany({ id IN [...tất cả maHoSoUngTuyen] }),  ← 1 query
]) ← 3 query chạy SONG SONG
            ↓
ganNguoiDungChoUngVien(ungVienRows)  ← join thêm NguoiDung vào UngVien
            ↓
Tạo Map<id, object> cho từng loại → tra cứu O(1)
            ↓
Output: [{ id, maUngVien: { id, maNguoiDung: {...}, viTriMongMuon }, maNhaTuyenDung: { id, tenCongTy, logo }, ... }, ...]
```

**Tại sao Map thay vì array.find?**
- `array.find(x => x.id === id)` → O(n) mỗi lần tìm → nếu có 100 đánh giá × 3 bảng = 300 lần tìm tuyến tính
- `map.get(id)` → O(1) → luôn nhanh bất kể dữ liệu nhiều bao nhiêu

---

### `chuanHoaDanhGia(taiLieu)`

Biến đổi raw object (sau hydrate) thành format chuẩn trả cho frontend:

```
Input (raw sau hydrate):
{
  id: "uuid",
  maUngVien: { id: "uv1", maNguoiDung: { hoTen: "Nguyễn A", email: "a@b.com" }, ... },
  maNhaTuyenDung: { id: "ntd1", tenCongTy: "Công ty X", logo: "url" },
  diem: 4,
  ...
}

Output (chuẩn hóa):
{
  id: "uuid",
  _id: "uuid",                          ← thêm _id cho tương thích
  maUngVien: "uv1",                     ← chỉ ID
  maNhaTuyenDung: "ntd1",               ← chỉ ID
  ungVien: {                            ← object phẳng thông tin cần thiết
    id: "uv1",
    hoTen: "Nguyễn A",
    email: "a@b.com",
    viTriMongMuon: "..."
  },
  nhaTuyenDung: {                       ← chỉ 3 field cần thiết
    id: "ntd1",
    tenCongTy: "Công ty X",
    logo: "url"
  },
  diem: 4,
  noiDung: "...",
  anDanh: false,
  daDuyet: false,
  ngayTao: "...",
  ngayCapNhat: "..."
}
```

---

### `layUngVienCuaNguoiDung(nguoiDung)`

Guard function — kiểm tra 2 điều kiện:
1. `vaiTro === 'ung_vien'` → nếu không: 403
2. Tồn tại record UngVien trong DB → nếu không: 422

Tách thành hàm riêng vì cả `layCuaUngVien` và `taoTuHoSo` đều cần, tránh lặp code.

---

### `damBaoDaCoKetQuaPhongVan(hoSo)`

Business rule quan trọng nhất của module. Kiểm tra phỏng vấn đã có kết quả:

```
Điều kiện cần thỏa mãn đồng thời:
  maHoSoUngTuyen = id(hoSo)    ← đúng hồ sơ
  trangThai = 'hoan_thanh'     ← phỏng vấn đã diễn ra xong
  ketQua IN ['dat', 'khong_dat'] ← đã có kết quả rõ ràng

Nếu không tìm thấy → 409 REVIEW_REQUIRES_INTERVIEW_RESULT
```

---

### `layDanhGiaDayDu(where, many)`

Helper gộp 2 bước: query + hydrate. Dùng chung cho mọi nơi cần lấy đánh giá đầy đủ.

```
many=true  → findMany(where, take:300, orderBy: ngayTao desc) → hydrate → trả mảng
many=false → findMany(where, take:1)                          → hydrate → trả object[0]
```

---

## 9. Các lỗi có thể xảy ra

| HTTP Code | Mã lỗi | Khi nào xảy ra |
|---|---|---|
| 401 | UNAUTHORIZED | Không có token hoặc token hết hạn |
| 403 | FORBIDDEN | Vai trò không phù hợp (NTD/admin cố tạo đánh giá như ứng viên, hoặc đánh giá từ hồ sơ của người khác) |
| 404 | - | Không tìm thấy đánh giá, hồ sơ ứng tuyển, hoặc công ty |
| 404 | APPLICATION_NOT_FOUND | Hồ sơ ứng tuyển không tồn tại |
| 404 | COMPANY_NOT_FOUND | Không lấy được công ty từ hồ sơ |
| 409 | REVIEW_ALREADY_EXISTS | 1 hồ sơ đã được đánh giá rồi (unique constraint) |
| 409 | REVIEW_REQUIRES_INTERVIEW_RESULT | Phỏng vấn chưa có kết quả |
| 422 | CANDIDATE_PROFILE_REQUIRED | Tài khoản ứng viên chưa tạo profile UngVien |
| 422 | VALIDATION_ERROR | Body không hợp lệ (thiếu field, sai kiểu dữ liệu) |

---

## 10. Quy tắc nghiệp vụ

1. **1 hồ sơ = 1 đánh giá:** Ràng buộc `@unique` trên `maHoSoUngTuyen` trong DB + kiểm tra trùng ở service → không thể đánh giá lại.

2. **Phải qua phỏng vấn:** Chỉ tạo được đánh giá khi có LichPhongVan trạng thái `hoan_thanh` và kết quả `dat` hoặc `khong_dat`.

3. **Không tự chọn công ty:** Ứng viên không truyền `maNhaTuyenDung` vào body — service tự lấy từ tin tuyển dụng trong hồ sơ ứng tuyển → tránh đánh giá sai công ty.

4. **Phải chờ admin duyệt:** `daDuyet` luôn tạo với giá trị `false`, chỉ admin mới cập nhật thành `true`.

5. **Ẩn danh là tùy chọn:** `anDanh = true` → frontend có thể ẩn thông tin ứng viên khi hiển thị.

6. **Xóa cascade:** Xóa ứng viên hoặc công ty → tất cả đánh giá liên quan bị xóa theo (`onDelete: Cascade`).

7. **Xóa hồ sơ ứng tuyển không mất đánh giá:** `onDelete: SetNull` → đánh giá vẫn còn, chỉ mất liên kết với hồ sơ.

# Kế hoạch Refactor — Loại bỏ tồn đọng MongoDB, thuần hóa Prisma

## Vấn đề hiện tại

Hệ thống đã chuyển sang **PostgreSQL + Prisma** nhưng code vẫn còn 2 lớp legacy từ thời MongoDB:

| Legacy pattern | Mô tả | Vấn đề |
|---|---|---|
| `hydrate()` thủ công | Query 3 bảng riêng lẻ rồi dùng Map ghép lại | Prisma `include` làm được, tốn thêm N query |
| `chuanHoa*()` thủ công | Check `?._id` để biết đã populate chưa | Prisma `include` luôn trả object đầy đủ, không cần check |
| `coId()` / `_id` pattern | Thêm `_id` vì MongoDB dùng `_id` | PostgreSQL dùng `id`, `_id` là dư thừa |
| `layDayDu(where, many)` | Wrapper bọc query + hydrate | Thay bằng Prisma `findMany/findUnique` trực tiếp |

---

## Danh sách module cần refactor

| Module | File dichvu | Có hydrate? | Có chuanHoa? | Mức độ phức tạp |
|---|---|---|---|---|
| `danhgiacongty` | danhgiacongty.dichvu.ts | ✅ `hydrate()` | ✅ `chuanHoaDanhGia` | Trung bình |
| `lichphongvan` | lichphongvan.dichvu.ts | ✅ `hydrateLich()` | ✅ `chuanHoaLich` | Cao (nhiều join lồng) |
| `hosoungtuyen` | hosoungtuyen.dichvu.ts | ✅ `hydrateUngTuyen()` | ✅ `chuanHoaUngTuyen` | Cao |
| `tintuyendung` | tintuyendung.dichvu.ts | ❌ (dùng `include`) | ✅ `chuanHoaTin` | Trung bình |
| `nhatuyendung` | nhatuyendung.dichvu.ts | ❌ (dùng prismaHelper) | ✅ `chuanHoaNhaTuyenDung` | Trung bình |
| `ungvien` | ungvien.dichvu.ts | ❌ | ✅ `chuanHoaUngVien` | Thấp |
| `vieclamdaluu` | vieclamdaluu.dichvu.ts | ✅ `hydrate()` | ✅ `chuanHoa` | Thấp |
| `hosonangluc` | hosonangluc.dichvu.ts | ❌ | ✅ `chuanHoaHoSo` (đơn giản) | Thấp |
| `tinnhan` | tinnhan.dichvu.ts | ✅ `hydrateConversation` | ❌ | Cao (chat logic) |
| `ai` | ai.dichvu.ts | ❌ | ✅ `chuanHoaKetQua` | Thấp |

---

## Nguyên tắc refactor

### Nguyên tắc 1 — Thay hydrate bằng Prisma `include`

```typescript
// ❌ TRƯỚC — hydrate thủ công
async function hydrate(rows: any[]) {
  const ungVienRows = await prisma.ungVien.findMany({ where: { id: { in: [...ids] } } })
  const congTyRows  = await prisma.nhaTuyenDung.findMany(...)
  const map = new Map(ungVienRows.map(r => [r.id, r]))
  return rows.map(row => ({ ...row, maUngVien: map.get(row.maUngVien) ?? row.maUngVien }))
}

// ✅ SAU — Prisma include
prisma.danhGiaCongTy.findMany({
  include: {
    ungVien: { include: { nguoiDung: { select: { hoTen: true, email: true } } } },
    nhaTuyenDung: { select: { id: true, tenCongTy: true, logo: true } },
    hoSoUngTuyen: true,
  }
})
```

---

### Nguyên tắc 2 — Bỏ `chuanHoa*()`, dùng `select` để kiểm soát field

```typescript
// ❌ TRƯỚC — chuanHoa check ?._id
function chuanHoaDanhGia(taiLieu: any) {
  return {
    ungVien: taiLieu.maUngVien?._id ? { id: String(taiLieu.maUngVien._id), ... } : undefined
  }
}

// ✅ SAU — Prisma select chỉ lấy field cần thiết, không cần check
prisma.danhGiaCongTy.findMany({
  include: {
    ungVien: {
      select: {
        id: true,
        viTriMongMuon: true,
        nguoiDung: { select: { hoTen: true, email: true } }
      }
    }
  }
})
// Kết quả: ungVien luôn là object hoặc null — không bao giờ là string ID
```

---

### Nguyên tắc 3 — Bỏ `_id`, chỉ dùng `id`

```typescript
// ❌ TRƯỚC
return { ...result, _id: result.id }    // coId()
return { id: "abc", _id: "abc", ... }

// ✅ SAU
return result   // Prisma đã có id, không cần _id
```

> **Lưu ý:** Phải kiểm tra frontend có chỗ nào dùng `._id` không trước khi bỏ.

---

### Nguyên tắc 4 — Bỏ `layDayDu(where, many)`, query trực tiếp

```typescript
// ❌ TRƯỚC
async function layDayDu(where: any, many = false) {
  const rows = many ? await Model.findMany({ where }) : await Model.findMany({ where, take: 1 })
  return many ? rows : rows[0]
}

// ✅ SAU
// Lấy nhiều
const rows = await prisma.danhGiaCongTy.findMany({ where, include: {...} })

// Lấy 1 theo ID
const row = await prisma.danhGiaCongTy.findUnique({ where: { id: ma }, include: {...} })
```

---

## Thứ tự thực hiện (ưu tiên thấp → cao)

### Bước 1 — Module đơn giản, ít quan hệ (làm trước để luyện tay)

#### `hosonangluc`
- `chuanHoaHoSo` chỉ map field đơn giản, không có quan hệ join
- Bỏ `coId()`, bỏ `chuanHoaHoSo`, trả thẳng Prisma result
- **Rủi ro: Thấp**

#### `ungvien`
- Thay `layDayDu` bằng `findMany/findUnique` với `include: { nguoiDung: true }`
- Bỏ `chuanHoaUngVien`
- **Rủi ro: Thấp**

#### `vieclamdaluu`
- Thay `hydrate()` bằng `include: { tinTuyenDung: { include: { nhaTuyenDung: true } } }`
- **Rủi ro: Thấp**

---

### Bước 2 — Module trung bình

#### `danhgiacongty`
- Thay `hydrate()` + `chuanHoaDanhGia` bằng:
```typescript
prisma.danhGiaCongTy.findMany({
  include: {
    ungVien: {
      include: {
        nguoiDung: { select: { hoTen: true, email: true, soDienThoai: true } }
      }
    },
    nhaTuyenDung: { select: { id: true, tenCongTy: true, logo: true } },
    hoSoUngTuyen: { select: { id: true, trangThai: true } },
  }
})
```
- **Rủi ro: Trung bình** (nhiều nơi dùng: HoSoCongTy, useUngVienData, AppDrawer)

#### `nhatuyendung`
- Thay `ganNguoiDungChoCongTy()` bằng `include: { nguoiDung: true }`
- Bỏ `chuanHoaNhaTuyenDung`
- **Rủi ro: Trung bình**

#### `tintuyendung`
- Đã dùng `include` rồi — chỉ cần bỏ `chuanHoaTin` vì Prisma tự join
- **Rủi ro: Trung bình** (lọc `cheDo` phức tạp, cẩn thận field name)

---

### Bước 3 — Module phức tạp (làm sau cùng)

#### `hosoungtuyen`
- Quan hệ sâu: HoSoUngTuyen → UngVien → NguoiDung + TinTuyenDung → NhaTuyenDung
- Cần `include` lồng nhiều cấp
- **Rủi ro: Cao** (được dùng bởi nhiều module khác)

#### `lichphongvan`
- Join sâu nhất: LichPhongVan → HoSoUngTuyen → UngVien → NguoiDung + TinTuyenDung → NhaTuyenDung
- `chuanHoaLich` phức tạp nhất trong hệ thống
- **Rủi ro: Cao**

#### `tinnhan`
- Logic chat, JSON fields, nhiều edge case
- **Rủi ro: Cao — để cuối cùng**

---

## Cách refactor từng module — Template chuẩn

Mỗi module làm theo đúng 4 bước này:

### Bước A — Xác định `include` cần thiết

Đọc `chuanHoa*()` hiện tại để biết frontend đang cần field nào, rồi viết `include` tương đương.

### Bước B — Thay `layDayDu` bằng query trực tiếp với `include`

```typescript
// Trước
const rows = await layDayDu({}, true)
return rows.map(chuanHoaXyz)

// Sau
const rows = await prisma.xyz.findMany({
  where: {},
  include: { ... },
  orderBy: { ngayTao: 'desc' },
  take: 300,
})
return rows  // đã đầy đủ, không cần map chuanHoa
```

### Bước C — Kiểm tra frontend dùng field nào

Grep tên field trong frontend để chắc chắn không đổi tên vô tình:
```
grep -r "\.ungVien\." frontend/src
grep -r "\._id" frontend/src
```

### Bước D — Xóa code không còn dùng

- Xóa hàm `hydrate*()`
- Xóa hàm `chuanHoa*()`
- Xóa import `coId`, `ganNguoiDungChoXyz` nếu không còn dùng
- Xóa hàm `layDayDu()` nội bộ

---

## Xử lý `_id` — Quan trọng

Frontend đang dùng `_id` ở một số chỗ. Trước khi bỏ `coId()`, phải kiểm tra:

```
grep -r "\._id" frontend/src --include="*.tsx" --include="*.ts"
```

**Nếu còn dùng `_id` ở frontend:** Có 2 cách:
1. Sửa frontend dùng `id` thay vì `_id` (khuyên dùng)
2. Giữ lại `_id` bằng cách thêm vào response: `{ ...result, _id: result.id }`

**Khuyến nghị:** Sửa frontend dùng `id` — sạch hơn, nhất quán với Prisma/PostgreSQL.

---

## Những gì KHÔNG nên thay đổi

| Không thay đổi | Lý do |
|---|---|
| Logic business rule (kiểm tra vai trò, điều kiện) | Không liên quan đến Mongo vs Prisma |
| Validation Zod | Đang hoạt động tốt |
| Error handling `LoiUngDung` | Đang hoạt động tốt |
| `boUndefined()` | Vẫn cần khi create/update |
| `locVaXepHangTheoTuKhoa()` | Tìm kiếm fuzzy, không liên quan |
| `tinnhan` module | Phức tạp, để riêng, cần sprint riêng |

---

## Checklist sau khi refactor mỗi module

- [ ] Chạy `tsc --noEmit` — không có lỗi TypeScript
- [ ] Test thủ công API endpoint (Postman hoặc browser)
- [ ] Kiểm tra frontend render đúng (tên, email, logo không bị undefined)
- [ ] Kiểm tra filter/lọc vẫn hoạt động (field name không đổi)
- [ ] Không còn import `coId`, `ganNguoiDung*`, `hydrate*` thừa
- [ ] File ngắn hơn đáng kể (nếu không ngắn hơn thì có thể còn sót)

---

## Ước tính kết quả sau refactor

| Module | Dòng code hiện tại (ước tính) | Sau refactor | Giảm |
|---|---|---|---|
| danhgiacongty.dichvu | ~145 dòng | ~60 dòng | ~58% |
| lichphongvan.dichvu | ~185 dòng | ~80 dòng | ~57% |
| hosoungtuyen.dichvu | ~210 dòng | ~90 dòng | ~57% |
| nhatuyendung.dichvu | ~137 dòng | ~70 dòng | ~49% |
| tintuyendung.dichvu | ~243 dòng | ~130 dòng | ~46% |

Tổng: loại bỏ khoảng **400-500 dòng code** legacy, hệ thống dễ đọc và dễ bảo trì hơn.

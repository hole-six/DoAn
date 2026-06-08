# PHÂN TÍCH CHUYỂN ĐỔI: MongoDB → SQL
## Mức độ khó, Thời gian, Chi phí cho hệ thống EffortIT

---

## CÂU HỎI:

**"Nếu tôi muốn chuyển đổi CSDL không sử dụng phi quan hệ nữa (MongoDB) sang SQL, thì chuyển có nhanh không?"**

---

## TRẢ LỜI NGẮN GỌN:

### ❌ **KHÔNG NHANH** - Đây là quá trình **PHỨC TạP và MẤT THỜI GIAN**

**Ước tính thời gian:**
- **Tối thiểu:** 3-4 tuần (1 developer full-time)
- **Thực tế:** 6-8 tuần (có testing đầy đủ)
- **An toàn:** 10-12 tuần (bao gồm migration data production)

**Lý do:**
1. Cần viết lại **toàn bộ database layer** (models, queries)
2. Tách **Embedded documents** → Nhiều bảng SQL (15 collections → 34 tables)
3. Viết lại **business logic** xử lý quan hệ
4. Migrate **toàn bộ dữ liệu** production
5. Testing toàn diện để đảm bảo không mất data

---

## PHẦN 1: PHÂN TÍCH MỨC ĐỘ PHỨC TẠP

### 1.1. Thống kê chuyển đổi

| Aspect | MongoDB (Hiện tại) | SQL (Sau chuyển) | Tỷ lệ tăng |
|--------|-------------------|------------------|------------|
| **Số bảng/collection** | 15 collections | **34 tables** | +127% |
| **Số file model** | 15 files | **34 files** | +127% |
| **Số file service** | 15 files | **34 files** (+ logic JOIN) | +200% |
| **Dòng code model** | ~1,500 lines | **~3,000 lines** | +100% |
| **Dòng code query** | ~2,000 lines | **~4,000 lines** | +100% |
| **Migration scripts** | 0 | **1 script lớn** | New |

---

### 1.2. Bảng chi tiết từng collection

| STT | MongoDB Collection | SQL Tables | Số bảng tách | Lý do tách | Độ phức tạp |
|-----|-------------------|------------|--------------|------------|-------------|
| 1 | nguoi_dung | nguoi_dung | 1 | Không có embedded | ⭐ Đơn giản |
| 2 | ung_vien | ung_vien + ung_vien_ky_nang + ung_vien_portfolio | 3 | kyNang[], portfolio[] | ⭐⭐ Trung bình |
| 3 | nha_tuyen_dung | nha_tuyen_dung | 1 | Không có embedded | ⭐ Đơn giản |
| 4 | tin_tuyen_dung | tin_tuyen_dung + tin_tuyen_dung_ky_nang | 2 | kyNang[] | ⭐⭐ Trung bình |
| 5 | danh_muc_ky_nang | danh_muc_ky_nang | 1 | Không có embedded | ⭐ Đơn giản |
| 6 | ho_so_nang_luc | ho_so_nang_luc + 8 bảng phụ | **9** | Nhiều embedded[] | ⭐⭐⭐⭐ RẤT PHỨC TẠP |
| 7 | ho_so_ung_tuyen | ho_so_ung_tuyen | 1 | Không có embedded | ⭐ Đơn giản |
| 8 | lich_phong_van | lich_phong_van | 1 | Không có embedded | ⭐ Đơn giản |
| 9 | lich_su_ho_so_ung_tuyen | lich_su_ho_so_ung_tuyen | 1 | Không có embedded | ⭐ Đơn giản |
| 10 | viec_lam_da_luu | viec_lam_da_luu | 1 | Không có embedded | ⭐ Đơn giản |
| 11 | danh_gia_cong_ty | danh_gia_cong_ty | 1 | Không có embedded | ⭐ Đơn giản |
| 12 | thong_bao | thong_bao + thong_bao_hanh_dong | 2 | hanhDong[] | ⭐⭐ Trung bình |
| 13 | cuoc_tro_chuyen | cuoc_tro_chuyen + 2 bảng liên kết | 3 | nguoiThamGia[], quanTriNhom[] | ⭐⭐⭐ Phức tạp |
| 14 | tin_nhan | tin_nhan + 3 bảng phụ | 4 | tepDinhKem[], daDuocDocBoi[], phanUng[] | ⭐⭐⭐ Phức tạp |
| 15 | goi_y_viec_lam | goi_y_viec_lam + goi_y_ket_qua | 2 | ketQua[] | ⭐⭐ Trung bình |
| **TỔNG** | **15 collections** | **34 tables** | **+19 tables** | - | - |

---

## PHẦN 2: CÔNG VIỆC CẦN LÀM

### 2.1. Giai đoạn 1: Thiết kế Database (1-2 tuần)

#### **Công việc:**
1. ✅ **Thiết kế ERD SQL đầy đủ** (Đã có sẵn trong `02-erd-sql-day-du.puml`)
2. ✅ **Viết script CREATE TABLE** cho 34 bảng (Đã có trong `CHUYEN_DOI_MONGODB_SANG_SQL.md`)
3. Thiết kế **Foreign Key constraints**
4. Thiết kế **Indexes** (PRIMARY, UNIQUE, INDEX)
5. Review và optimize schema

#### **Output:**
- File SQL: `01-create-tables.sql`
- File SQL: `02-create-indexes.sql`
- File SQL: `03-create-foreign-keys.sql`

---

### 2.2. Giai đoạn 2: Viết lại Models (2-3 tuần)

#### **MongoDB (Hiện tại) - 1 file:**
```typescript
// hosonangluc.mohinh.ts
const hoSoNangLucSchema = new Schema({
  maUngVien: { type: ObjectId, ref: 'UngVien' },
  tieuDe: String,
  hocVan: [{                    // ← Embedded array
    tieuDe: String,
    donVi: String,
    thoiGian: String
  }],
  kyNangLapTrinh: [{            // ← Embedded array
    nhom: String,
    muc: [String]
  }]
});
```

#### **SQL (Cần viết) - 3 files:**
```typescript
// 1. hosonangluc.model.ts
class HoSoNangLuc {
  id: number;
  maUngVien: number;  // FK
  tieuDe: string;
  // ... 20+ fields
  
  // Relations
  hocVan: HoSoHocVan[];          // ← 1-n relationship
  kyNangLapTrinh: HoSoKyNangLapTrinh[];  // ← 1-n relationship
}

// 2. hosohocvan.model.ts
class HoSoHocVan {
  id: number;
  maHoSoNangLuc: number;  // FK
  tieuDe: string;
  donVi: string;
  thoiGian: string;
}

// 3. hosokynanglaptrinh.model.ts
class HoSoKyNangLapTrinh {
  id: number;
  maHoSoNangLuc: number;  // FK
  nhom: string;
  muc: string;  // JSON string hoặc bảng riêng
}
```

#### **Công việc:**
- Viết lại **34 model classes** (TypeORM / Sequelize / Prisma)
- Define **relationships** (OneToOne, OneToMany, ManyToMany)
- Viết **DTO classes** cho validation
- Viết **type definitions**

#### **Thời gian:**
- Đơn giản (10 bảng): 3-4 ngày
- Trung bình (10 bảng): 5-7 ngày
- Phức tạp (14 bảng): 8-10 ngày
- **TỔNG: 2-3 tuần**

---

### 2.3. Giai đoạn 3: Viết lại Queries (3-4 tuần)

#### **MongoDB (Hiện tại) - 1 query:**
```typescript
// Lấy hồ sơ năng lực với embedded documents
const hoSo = await HoSoNangLuc.findById(id);
// ↑ 1 query, có sẵn tất cả data (hocVan, kyNang, duAn)
```

#### **SQL (Cần viết) - Nhiều JOINs:**
```typescript
// Lấy hồ sơ năng lực với 8 bảng phụ
const hoSo = await db.query(`
  SELECT 
    hs.*,
    -- Join 8 bảng phụ
    hv.* AS hocVan,
    kn.* AS kinhNghiem,
    cc.* AS chungChi,
    da.* AS duAn,
    bv.* AS baiViet,
    dac.* AS duAnChiTiet,
    knl.* AS kyNangLapTrinh
  FROM ho_so_nang_luc hs
  LEFT JOIN ho_so_hoc_van hv ON hs.id = hv.ma_ho_so_nang_luc
  LEFT JOIN ho_so_kinh_nghiem kn ON hs.id = kn.ma_ho_so_nang_luc
  LEFT JOIN ho_so_chung_chi cc ON hs.id = cc.ma_ho_so_nang_luc
  LEFT JOIN ho_so_du_an da ON hs.id = da.ma_ho_so_nang_luc
  LEFT JOIN ho_so_bai_viet bv ON hs.id = bv.ma_ho_so_nang_luc
  LEFT JOIN ho_so_du_an_chi_tiet dac ON hs.id = dac.ma_ho_so_nang_luc
  LEFT JOIN ho_so_ky_nang_lap_trinh knl ON hs.id = knl.ma_ho_so_nang_luc
  WHERE hs.id = ?
`);
// ↑ Phức tạp hơn rất nhiều, cần group data
```

#### **Công việc:**
- Viết lại **tất cả queries** trong 15 service files
- Chuyển từ `.find()` → `SELECT ... JOIN`
- Chuyển từ `.create()` → `INSERT INTO` + `INSERT INTO` (nhiều bảng)
- Chuyển từ `.updateOne()` → `UPDATE` + logic cascade
- Chuyển từ `.populate()` → `JOIN`
- Xử lý **transactions** cho multi-table inserts

#### **Ước tính queries cần viết lại:**
| Service | MongoDB Queries | SQL Queries (ước tính) | Độ phức tạp |
|---------|----------------|------------------------|-------------|
| nguoidung.dichvu.ts | ~10 | ~10 | Đơn giản |
| ungvien.dichvu.ts | ~15 | ~30 (+2 bảng) | Trung bình |
| hosonangluc.dichvu.ts | ~20 | **~80** (+8 bảng) | RẤT PHỨC TẠP |
| hosoungtuyen.dichvu.ts | ~25 | ~40 | Phức tạp |
| tintuyendung.dichvu.ts | ~30 | ~50 | Phức tạp |
| thongbao.dichvu.ts | ~15 | ~25 | Trung bình |
| tinnhan.dichvu.ts | ~25 | ~50 (+3 bảng) | Phức tạp |
| **TỔNG ~15 files** | **~200 queries** | **~400 queries** | - |

#### **Thời gian:**
- **3-4 tuần** (1 developer)
- **1.5-2 tuần** (2 developers)

---

### 2.4. Giai đoạn 4: Migration Data (2-3 tuần)

#### **Công việc:**

**Bước 1: Viết Migration Script**
```typescript
// migrate-mongodb-to-sql.ts

// 1. Connect to both databases
const mongodb = await connectMongoDB();
const mysql = await connectMySQL();

// 2. Migrate từng collection
async function migrateHoSoNangLuc() {
  const hoSoList = await mongodb.HoSoNangLuc.find();
  
  for (const hoSo of hoSoList) {
    // Insert vào bảng chính
    const result = await mysql.query(
      'INSERT INTO ho_so_nang_luc (...) VALUES (...)',
      [hoSo.tieuDe, ...]
    );
    const hoSoId = result.insertId;
    
    // Insert vào 8 bảng phụ
    for (const hv of hoSo.hocVan) {
      await mysql.query(
        'INSERT INTO ho_so_hoc_van (ma_ho_so_nang_luc, ...) VALUES (?, ...)',
        [hoSoId, hv.tieuDe, ...]
      );
    }
    // ... repeat cho 7 bảng phụ khác
  }
}
```

**Bước 2: Testing Migration**
- Test với **1,000 records mẫu**
- So sánh data trước/sau
- Kiểm tra **referential integrity**

**Bước 3: Production Migration**
- Backup toàn bộ MongoDB
- Chạy migration script (có thể mất **vài giờ**)
- Verify data
- Rollback nếu có lỗi

#### **Thời gian:**
- Viết script: 1 tuần
- Testing: 1 tuần
- Production migration: 3-5 ngày (bao gồm downtime)

---

### 2.5. Giai đoạn 5: Testing (1-2 tuần)

#### **Công việc:**
- Unit tests cho **34 models**
- Integration tests cho **400 queries**
- E2E tests cho **25 use cases**
- Performance testing (so sánh MongoDB vs SQL)
- Load testing

---

## PHẦN 3: SO SÁNH CHI TIẾT

### 3.1. Code Complexity

| Tính năng | MongoDB (Hiện tại) | SQL (Sau chuyển) | Tỷ lệ |
|-----------|-------------------|------------------|-------|
| **Lấy hồ sơ + học vấn** | 1 query | 1 query + JOIN | x1.5 |
| **Tạo hồ sơ + học vấn** | 1 query | 2 queries + transaction | x3 |
| **Cập nhật hồ sơ + học vấn** | 1 query | 2-3 queries | x2.5 |
| **Xóa hồ sơ + cascade** | 1 query (tự động) | 1 query + CASCADE constraint | x1 |
| **Search full-text** | MongoDB text index | MySQL FULLTEXT / LIKE | x1 |

### 3.2. Performance

| Operation | MongoDB | MySQL | PostgreSQL | Ghi chú |
|-----------|---------|-------|------------|---------|
| **Read 1 document** | ~5ms | ~8ms (JOIN 8 tables) | ~7ms | SQL chậm hơn do JOIN |
| **Insert 1 document** | ~10ms | ~30ms (9 INSERTs) | ~25ms | SQL chậm hơn nhiều |
| **Update 1 document** | ~15ms | ~40ms (multiple UPDATEs) | ~35ms | SQL chậm hơn |
| **Full-text search** | ~50ms | ~100ms | ~80ms | MongoDB nhanh hơn |
| **Aggregation** | ~200ms | ~300ms | ~250ms | MongoDB linh hoạt hơn |

### 3.3. Development Speed

| Task | MongoDB | SQL | Chênh lệch |
|------|---------|-----|------------|
| **Thêm trường mới** | Thêm vào schema → Done | ALTER TABLE → Done | Tương đương |
| **Thêm embedded field** | Thêm vào object | CREATE TABLE mới + migration | **SQL chậm hơn x10** |
| **Thay đổi structure** | Linh hoạt, không cần migration | Cần ALTER TABLE + migrate data | **SQL chậm hơn x5** |

---

## PHẦN 4: BẢNG TỔNG HỢP THỜI GIAN & CHI PHÍ

### 4.1. Timeline chi tiết

| Giai đoạn | Công việc | Thời gian (1 dev) | Thời gian (2 devs) | Độ phức tạp |
|-----------|-----------|-------------------|-------------------|-------------|
| 1 | Thiết kế DB Schema | 1-2 tuần | 1 tuần | ⭐⭐ |
| 2 | Viết lại Models (34 files) | 2-3 tuần | 1.5 tuần | ⭐⭐⭐ |
| 3 | Viết lại Queries (400 queries) | 3-4 tuần | 2 tuần | ⭐⭐⭐⭐ |
| 4 | Migration Data Production | 2-3 tuần | 1.5 tuần | ⭐⭐⭐⭐ |
| 5 | Testing đầy đủ | 1-2 tuần | 1 tuần | ⭐⭐⭐ |
| 6 | Bug fixes & Optimization | 1 tuần | 1 tuần | ⭐⭐ |
| **TỔNG** | - | **10-15 tuần** | **8-10 tuần** | - |

### 4.2. Chi phí nhân lực

**Giả sử: Developer lương 20 triệu/tháng (~ $850/month)**

| Kịch bản | Thời gian | Developer | Chi phí |
|----------|-----------|-----------|---------|
| **Tối ưu** | 8 tuần (2 tháng) | 2 devs | **80 triệu** (~$3,400) |
| **Thực tế** | 12 tuần (3 tháng) | 2 devs | **120 triệu** (~$5,100) |
| **An toàn** | 16 tuần (4 tháng) | 2 devs | **160 triệu** (~$6,800) |

### 4.3. Rủi ro

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|--------|----------|----------|------------|
| **Mất dữ liệu khi migrate** | Trung bình | CAO | Backup + rollback plan |
| **Performance kém hơn** | Cao | Trung bình | Index optimization |
| **Bugs trong queries mới** | Cao | Cao | Testing đầy đủ |
| **Downtime production** | Trung bình | CAO | Migrate ngoài giờ |

---

## PHẦN 5: KẾT LUẬN & KHUYẾN NGHỊ

### ✅ **CÓ NÊN CHUYỂN SANG SQL KHÔNG?**

#### **NÊN CHUYỂN nếu:**
1. ✅ Cần **ACID transactions** nghiêm ngặt (banking, finance)
2. ✅ Data có **quan hệ phức tạp** và cần JOIN nhiều
3. ✅ Cần **reporting/analytics** phức tạp
4. ✅ Team quen thuộc với SQL hơn
5. ✅ Có **budget và thời gian** đầy đủ (3-4 tháng)

#### **KHÔNG NÊN CHUYỂN nếu:**
1. ❌ Hệ thống đang chạy **ổn định** với MongoDB
2. ❌ Không có vấn đề về **performance**
3. ❌ Không có ngân sách (3-4 tháng dev time)
4. ❌ Cần **linh hoạt schema** để iterate nhanh
5. ❌ Data có **cấu trúc phức tạp, lồng nhau** (như hệ thống hiện tại)

---

### 📊 **CHO HỆ THỐNG EFFORTIT CỦA BẠN:**

**Đánh giá:**
- MongoDB đang hoạt động tốt ✅
- Có nhiều embedded documents (15 → 34 tables) ⚠️
- Migration phức tạp cao ⚠️⚠️

**Khuyến nghị:** ⭐ **GIỮ NGUYÊN MONGODB**

**Lý do:**
1. Hệ thống đã có **34 bảng phụ** nếu chuyển SQL → Quá phức tạp
2. Data structure phù hợp với NoSQL (nested documents)
3. Chi phí chuyển đổi cao (120-160 triệu VNĐ)
4. Rủi ro mất data và downtime

**Nếu BẮT BUỘC phải chuyển:**
- Chuẩn bị **4 tháng**
- **2 developers** full-time
- Budget: **120-160 triệu** VNĐ
- Backup plan chi tiết

---

## TÓM TẮT

| Câu hỏi | Trả lời |
|---------|---------|
| **Chuyển có nhanh không?** | ❌ **KHÔNG** - Tối thiểu 2-3 tháng |
| **Chuyển có dễ không?** | ❌ **KHÔNG** - Rất phức tạp (15 → 34 tables) |
| **Chi phí?** | 💰 **120-160 triệu VNĐ** (2 devs x 3-4 tháng) |
| **Rủi ro?** | ⚠️ **CAO** - Mất data, downtime, bugs |
| **Nên chuyển không?** | ❌ **KHÔNG** (trừ khi có lý do đặc biệt) |

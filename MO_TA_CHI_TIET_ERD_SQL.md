# MÔ TẢ CHI TIẾT ERD PHIÊN BẢN SQL
## Hệ thống EffortIT - Đầy đủ 34 bảng

---

## TỔNG QUAN

### Thống kê hệ thống

| Loại | Số lượng | Ghi chú |
|------|----------|---------|
| **Bảng chính** | 15 bảng | Bảng nghiệp vụ chính |
| **Bảng liên kết n-n** | 6 bảng | UngVienKyNang, TinTuyenDungKyNang, CuocTroChuyenThanhVien, etc. |
| **Bảng phụ 1-n** | 13 bảng | HoSoHocVan, HoSoDuAn, TinNhanTepDinhKem, etc. |
| **TỔNG CỘNG** | **34 bảng** | Chuyển từ 15 collections MongoDB |

### So sánh với MongoDB

| MongoDB | SQL | Lý do tách bảng |
|---------|-----|-----------------|
| 15 collections | 34 tables | Embedded documents → Separate tables |
| ObjectId | INT | Khóa chính AUTO_INCREMENT |
| String[] | TEXT (JSON) hoặc bảng riêng | Array → JSON hoặc 1-n |
| Embedded[] | Bảng riêng 1-n | Document lồng → Bảng liên kết |
| Map<K,V> | Bảng riêng | Key-value → Bảng 1-n |

---

## PHẦN 1: BẢNG CHÍNH - TÀI KHOẢN VÀ VAI TRÒ

### 1.1. NGUOIDUNG (nguoi_dung)

**Mô tả:** Bảng lưu thông tin tài khoản người dùng hệ thống

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|--------|--------------|-----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập (duy nhất) |
| `mat_khau` | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa (bcrypt) |
| `ho_ten` | VARCHAR(255) | NOT NULL | Họ và tên đầy đủ |
| `so_dien_thoai` | VARCHAR(20) | NULL | Số điện thoại liên hệ |
| `vai_tro` | ENUM | DEFAULT 'ung_vien' | Vai trò: 'ung_vien', 'nha_tuyen_dung', 'admin' |
| `trang_thai` | ENUM | DEFAULT 'hoat_dong' | Trạng thái: 'hoat_dong', 'tam_khoa', 'bi_khoa' |
| `ma_dat_lai_mat_khau_hash` | VARCHAR(255) | NULL | Token reset password (tạm thời) |
| `ma_dat_lai_mat_khau_het_han` | DATETIME | NULL | Thời gian hết hạn token reset |
| `ngay_tao` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày tạo tài khoản |
| `ngay_cap_nhat` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật cuối |

**Chuyển đổi từ MongoDB:**
```javascript
// MongoDB
_id: ObjectId("...") → id: INT AUTO_INCREMENT
email: String → email: VARCHAR(255) UNIQUE
vaiTro: String (enum) → vai_tro: ENUM('ung_vien', 'nha_tuyen_dung', 'admin')
```

---

### 1.2. UNGVIEN (ung_vien)

**Mô tả:** Thông tin hồ sơ ứng viên

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|--------|--------------|-----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `ma_nguoi_dung` | INT | FK, UNIQUE, NOT NULL | FK → NGUOIDUNG(id) |
| `ngay_sinh` | DATE | NULL | Ngày sinh (YYYY-MM-DD) |
| `gioi_tinh` | ENUM | NULL | 'nam', 'nu', 'khac' |
| `dia_chi` | VARCHAR(500) | NULL | Địa chỉ cư trú |
| `anh_dai_dien` | VARCHAR(500) | NULL | URL ảnh đại diện |
| `tom_tat` | TEXT | NULL | Giới thiệu bản thân ngắn gọn |
| `kinh_nghiem` | INT | DEFAULT 0 | Số năm kinh nghiệm làm việc |
| `vi_tri_mong_muon` | VARCHAR(200) | NULL | Vị trí công việc mong muốn |
| `muc_luong_mong_muon` | DECIMAL(15,2) | NULL | Mức lương mong muốn (VNĐ) |
| `ngay_tao` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `ngay_cap_nhat` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật |

**Quan hệ:**
- 1 NGUOIDUNG → 1 UNGVIEN (1-1)
- 1 UNGVIEN → n UNGVIEN_KYNANG (1-n)
- 1 UNGVIEN → n UNGVIEN_PORTFOLIO (1-n)

**Chuyển đổi từ MongoDB:**
```javascript
// MongoDB
kyNang: [{ maKyNang: ObjectId, mucDo: Number }]
→ SQL: Bảng UNGVIEN_KYNANG riêng

portfolio: [{ tenDuAn, lienKet, moTa, congNghe[] }]
→ SQL: Bảng UNGVIEN_PORTFOLIO riêng
```

---

### 1.3. NHATUYENDUNG (nha_tuyen_dung)

**Mô tả:** Thông tin công ty nhà tuyển dụng

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|--------|--------------|-----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `ma_nguoi_dung` | INT | FK, UNIQUE, NOT NULL | FK → NGUOIDUNG(id) |
| `ten_cong_ty` | VARCHAR(255) | NOT NULL | Tên công ty |
| `ma_so_thue` | VARCHAR(20) | NULL | ⭐ **MỚI BỔ SUNG** - Mã số thuế công ty |
| `mo_ta` | TEXT | NULL | Mô tả về công ty |
| `dia_chi` | VARCHAR(255) | DEFAULT 'Da Nang' | Địa chỉ trụ sở |
| `website` | VARCHAR(255) | NULL | Website công ty |
| `logo` | VARCHAR(500) | NULL | URL logo công ty |
| `quy_mo` | INT | NULL | Số lượng nhân sự |
| `nganh` | VARCHAR(100) | DEFAULT 'Cong nghe thong tin' | Ngành nghề |
| `trang_thai_duyet` | ENUM | DEFAULT 'cho_duyet' | ⭐ **MỚI BỔ SUNG** - 'cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa' |
| `ly_do_tu_choi` | VARCHAR(500) | NULL | ⭐ **MỚI BỔ SUNG** - Lý do admin từ chối duyệt |
| `ngay_duyet` | DATETIME | NULL | ⭐ **MỚI BỔ SUNG** - Ngày admin duyệt công ty |
| `ngay_tao` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày đăng ký |
| `ngay_cap_nhat` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật |

**Trường bổ sung (4 trường mới):**
1. `ma_so_thue` - Dùng để xác minh pháp lý công ty
2. `trang_thai_duyet` - Quy trình kiểm duyệt công ty trước khi cho phép đăng tin
3. `ly_do_tu_choi` - Ghi chú lý do nếu admin từ chối
4. `ngay_duyet` - Timestamp khi admin duyệt

---

## PHẦN 2: BẢNG CHÍNH - TUYỂN DỤNG

### 2.1. DANHMUC_KYNANG (danh_muc_ky_nang)

**Mô tả:** Danh mục kỹ năng nghề nghiệp (Skills catalog)

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |

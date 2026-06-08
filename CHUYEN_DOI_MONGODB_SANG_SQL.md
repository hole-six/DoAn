# CHUYỂN ĐỔI CÁC TRƯỜNG BỔ SUNG: MongoDB → SQL
## Áp dụng cho hệ thống EffortIT

---

## PHẦN 1: NHA_TUYEN_DUNG - 4 trường bổ sung

### **MongoDB (Mongoose Schema):**
```typescript
maSoThue: String
trangThaiDuyet: { type: String, enum: ['cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa'] }
lyDoTuChoi: String
ngayDuyet: Date
```

### **SQL (MySQL/SQL Server):**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) | Constraint |
|----------------|---------------|------------------|-----------------------|------------|
| `maSoThue` | String | **VARCHAR(20)** | **NVARCHAR(20)** | NULL |
| `trangThaiDuyet` | Enum | **ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa')** | **NVARCHAR(20)** CHECK (...) | DEFAULT 'cho_duyet' |
| `lyDoTuChoi` | String | **TEXT** | **NVARCHAR(500)** | NULL |
| `ngayDuyet` | Date | **DATETIME** | **DATETIME2** | NULL |

### **SQL CREATE TABLE (MySQL):**
```sql
ALTER TABLE nha_tuyen_dung ADD COLUMN (
  ma_so_thue VARCHAR(20),
  trang_thai_duyet ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa') DEFAULT 'cho_duyet',
  ly_do_tu_choi TEXT,
  ngay_duyet DATETIME
);
```

### **SQL CREATE TABLE (SQL Server):**
```sql
ALTER TABLE nha_tuyen_dung ADD
  ma_so_thue NVARCHAR(20) NULL,
  trang_thai_duyet NVARCHAR(20) DEFAULT 'cho_duyet'
    CHECK (trang_thai_duyet IN ('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa')),
  ly_do_tu_choi NVARCHAR(500) NULL,
  ngay_duyet DATETIME2 NULL;
```

---

## PHẦN 2: HO_SO_NANG_LUC - 18 trường bổ sung

### **Nhóm 2.1: Thông tin liên hệ (4 trường)**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) |
|----------------|---------------|------------------|-----------------------|
| `facebook` | String | **VARCHAR(255)** | **NVARCHAR(255)** |
| `github` | String | **VARCHAR(255)** | **NVARCHAR(255)** |
| `portfolioUrl` | String | **VARCHAR(255)** | **NVARCHAR(255)** |
| `diaDiem` | String | **VARCHAR(200)** | **NVARCHAR(200)** |

**SQL (MySQL):**
```sql
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  facebook VARCHAR(255),
  github VARCHAR(255),
  portfolio_url VARCHAR(255),
  dia_diem VARCHAR(200)
);
```

**SQL (SQL Server):**
```sql
ALTER TABLE ho_so_nang_luc ADD
  facebook NVARCHAR(255) NULL,
  github NVARCHAR(255) NULL,
  portfolio_url NVARCHAR(255) NULL,
  dia_diem NVARCHAR(200) NULL;
```

---

### **Nhóm 2.2: Kỹ năng & Kinh nghiệm (4 trường)**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) | Ghi chú |
|----------------|---------------|------------------|-----------------------|---------|
| `tomTatKinhNghiem` | String[] | **TEXT** (JSON) | **NVARCHAR(MAX)** (JSON) | Lưu dạng JSON array |
| `kyNangMem` | String[] | **TEXT** (JSON) | **NVARCHAR(MAX)** (JSON) | Lưu dạng JSON array |
| `baiVietKyThuat` | Embedded[] | **(Tách bảng)** | **(Tách bảng)** | Tạo bảng `ho_so_bai_viet` |
| `duAnChiTiet` | Embedded[] | **(Tách bảng)** | **(Tách bảng)** | Tạo bảng `ho_so_du_an_chi_tiet` |

**SQL (MySQL) - Trường JSON:**
```sql
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  tom_tat_kinh_nghiem TEXT,  -- Lưu dạng: ["Item 1", "Item 2"]
  ky_nang_mem TEXT           -- Lưu dạng: ["Communication", "Teamwork"]
);
```

**SQL (SQL Server) - Trường JSON:**
```sql
ALTER TABLE ho_so_nang_luc ADD
  tom_tat_kinh_nghiem NVARCHAR(MAX) NULL,  -- JSON array
  ky_nang_mem NVARCHAR(MAX) NULL;          -- JSON array
```

**Bảng mới: ho_so_bai_viet**
```sql
-- MySQL
CREATE TABLE ho_so_bai_viet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  nhan VARCHAR(255),
  url VARCHAR(500),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- SQL Server
CREATE TABLE ho_so_bai_viet (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  nhan NVARCHAR(255),
  url NVARCHAR(500),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);
```

**Bảng mới: ho_so_du_an_chi_tiet**
```sql
-- MySQL
CREATE TABLE ho_so_du_an_chi_tiet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  ten_du_an VARCHAR(255),
  thoi_gian VARCHAR(100),
  vi_tri VARCHAR(100),
  mo_ta TEXT,
  trach_nhiem TEXT,  -- JSON array
  he_dieu_hanh VARCHAR(100),
  ngon_ngu VARCHAR(100),
  framework VARCHAR(100),
  ky_thuat VARCHAR(255),
  dia_diem VARCHAR(200),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- SQL Server
CREATE TABLE ho_so_du_an_chi_tiet (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  ten_du_an NVARCHAR(255),
  thoi_gian NVARCHAR(100),
  vi_tri NVARCHAR(100),
  mo_ta NVARCHAR(MAX),
  trach_nhiem NVARCHAR(MAX),  -- JSON array
  he_dieu_hanh NVARCHAR(100),
  ngon_ngu NVARCHAR(100),
  framework NVARCHAR(100),
  ky_thuat NVARCHAR(255),
  dia_diem NVARCHAR(200),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);
```

---

### **Nhóm 2.3: File CV Upload (6 trường)**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) | Ghi chú |
|----------------|---------------|------------------|-----------------------|---------|
| `fileCvTen` | String | **VARCHAR(255)** | **NVARCHAR(255)** | Tên file gốc |
| `fileCvLoai` | String | **VARCHAR(50)** | **NVARCHAR(50)** | MIME type: 'application/pdf' |
| `fileCvData` | String | **LONGTEXT** | **NVARCHAR(MAX)** | Base64 hoặc path |
| `fileCvText` | String | **LONGTEXT** | **NVARCHAR(MAX)** | Text trích xuất từ CV |
| `fileCvPath` | String | **VARCHAR(500)** | **NVARCHAR(500)** | Path lưu file |
| `fileCvTextStatus` | Enum | **ENUM(...)** | **NVARCHAR(20)** CHECK | 'ok', 'empty', 'gemini_pdf', 'failed' |

**SQL (MySQL):**
```sql
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  file_cv_ten VARCHAR(255),
  file_cv_loai VARCHAR(50),
  file_cv_data LONGTEXT,
  file_cv_text LONGTEXT,
  file_cv_path VARCHAR(500),
  file_cv_text_status ENUM('ok', 'empty', 'gemini_pdf', 'failed') DEFAULT 'empty'
);
```

**SQL (SQL Server):**
```sql
ALTER TABLE ho_so_nang_luc ADD
  file_cv_ten NVARCHAR(255) NULL,
  file_cv_loai NVARCHAR(50) NULL,
  file_cv_data NVARCHAR(MAX) NULL,
  file_cv_text NVARCHAR(MAX) NULL,
  file_cv_path NVARCHAR(500) NULL,
  file_cv_text_status NVARCHAR(20) DEFAULT 'empty'
    CHECK (file_cv_text_status IN ('ok', 'empty', 'gemini_pdf', 'failed'));
```

---

### **Nhóm 2.4: CV Builder UI (6 trường)**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) | Ghi chú |
|----------------|---------------|------------------|-----------------------|---------|
| `anhDaiDien` | String | **VARCHAR(500)** | **NVARCHAR(500)** | URL ảnh đại diện |
| `templateCv` | String | **VARCHAR(50)** | **NVARCHAR(50)** | Template ID: 'classic-blue' |
| `mauChinh` | String | **VARCHAR(20)** | **NVARCHAR(20)** | Hex color: '#2563eb' |
| `mauPhu` | String | **VARCHAR(20)** | **NVARCHAR(20)** | Hex color: '#0f172a' |
| `font` | String | **VARCHAR(50)** | **NVARCHAR(50)** | Font name: 'Inter' |
| `fileCvTextError` | String | **TEXT** | **NVARCHAR(MAX)** | Error message |

**SQL (MySQL):**
```sql
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  anh_dai_dien VARCHAR(500),
  template_cv VARCHAR(50) DEFAULT 'classic-blue',
  mau_chinh VARCHAR(20) DEFAULT '#2563eb',
  mau_phu VARCHAR(20) DEFAULT '#0f172a',
  font VARCHAR(50) DEFAULT 'Inter',
  file_cv_text_error TEXT
);
```

**SQL (SQL Server):**
```sql
ALTER TABLE ho_so_nang_luc ADD
  anh_dai_dien NVARCHAR(500) NULL,
  template_cv NVARCHAR(50) DEFAULT 'classic-blue',
  mau_chinh NVARCHAR(20) DEFAULT '#2563eb',
  mau_phu NVARCHAR(20) DEFAULT '#0f172a',
  font NVARCHAR(50) DEFAULT 'Inter',
  file_cv_text_error NVARCHAR(MAX) NULL;
```

---

### **Nhóm 2.5: Markdown & AI (2 trường)**

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) |
|----------------|---------------|------------------|-----------------------|
| `markdownGoc` | String | **LONGTEXT** | **NVARCHAR(MAX)** |
| `ghiChuAi` | String | **TEXT** | **NVARCHAR(MAX)** |

**SQL (MySQL):**
```sql
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  markdown_goc LONGTEXT,
  ghi_chu_ai TEXT
);
```

**SQL (SQL Server):**
```sql
ALTER TABLE ho_so_nang_luc ADD
  markdown_goc NVARCHAR(MAX) NULL,
  ghi_chu_ai NVARCHAR(MAX) NULL;
```

---

## PHẦN 3: THONG_BAO - 4 trường bổ sung

| Trường MongoDB | Kiểu Mongoose | Kiểu SQL (MySQL) | Kiểu SQL (SQL Server) | Ghi chú |
|----------------|---------------|------------------|-----------------------|---------|
| `daGui` | Boolean | **TINYINT(1)** | **BIT** | 0/1 |
| `hanhDong` | Embedded[] | **(Tách bảng)** | **(Tách bảng)** | Bảng `thong_bao_hanh_dong` |
| `icon` | String | **VARCHAR(50)** | **NVARCHAR(50)** | Icon name |
| `mauSac` | String | **VARCHAR(20)** | **NVARCHAR(20)** | Hex color |

**SQL (MySQL):**
```sql
ALTER TABLE thong_bao ADD COLUMN (
  da_gui TINYINT(1) DEFAULT 0,
  icon VARCHAR(50),
  mau_sac VARCHAR(20)
);
```

**SQL (SQL Server):**
```sql
ALTER TABLE thong_bao ADD
  da_gui BIT DEFAULT 0,
  icon NVARCHAR(50) NULL,
  mau_sac NVARCHAR(20) NULL;
```

**Bảng mới: thong_bao_hanh_dong**
```sql
-- MySQL
CREATE TABLE thong_bao_hanh_dong (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_thong_bao INT NOT NULL,
  nhan VARCHAR(100),
  url VARCHAR(500),
  loai ENUM('primary', 'secondary', 'danger') DEFAULT 'primary',
  FOREIGN KEY (ma_thong_bao) REFERENCES thong_bao(id) ON DELETE CASCADE
);

-- SQL Server
CREATE TABLE thong_bao_hanh_dong (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_thong_bao INT NOT NULL,
  nhan NVARCHAR(100),
  url NVARCHAR(500),
  loai NVARCHAR(20) DEFAULT 'primary'
    CHECK (loai IN ('primary', 'secondary', 'danger')),
  FOREIGN KEY (ma_thong_bao) REFERENCES thong_bao(id) ON DELETE CASCADE
);
```

---

## PHẦN 4: BẢNG TÓM TẮT CHUYỂN ĐỔI

### **4.1. Tổng hợp các trường bổ sung**

| Bảng | Số trường MongoDB | Số trường SQL | Số bảng phụ SQL | Tổng cộng |
|------|-------------------|---------------|-----------------|-----------|
| **nha_tuyen_dung** | 4 | 4 | 0 | 4 cột |
| **ho_so_nang_luc** | 18 | 12 | 2 bảng | 12 cột + 2 bảng |
| **thong_bao** | 4 | 3 | 1 bảng | 3 cột + 1 bảng |
| **TỔNG** | **26** | **19** | **3 bảng** | **19 cột + 3 bảng phụ** |

---

### **4.2. Ánh xạ kiểu dữ liệu tổng quát**

| Mongoose Type | MySQL Type | SQL Server Type | Ghi chú |
|---------------|------------|-----------------|---------|
| `String` | **VARCHAR(n)** | **NVARCHAR(n)** | Độ dài cố định |
| `String` (long) | **TEXT** hoặc **LONGTEXT** | **NVARCHAR(MAX)** | Văn bản dài |
| `Number` (Int) | **INT** | **INT** | Số nguyên 32-bit |
| `Number` (Float) | **FLOAT** hoặc **DOUBLE** | **FLOAT** | Số thực |
| `Boolean` | **TINYINT(1)** | **BIT** | 0 = false, 1 = true |
| `Date` | **DATE** | **DATE** | Chỉ ngày |
| `Date` (with time) | **DATETIME** | **DATETIME2** | Ngày + giờ |
| `ObjectId` | **INT** (FK) | **INT** (FK) | Khóa ngoại |
| `Enum` | **ENUM('a','b')** | **NVARCHAR(n)** + CHECK | Tập giá trị cố định |
| `String[]` | **TEXT** (JSON) | **NVARCHAR(MAX)** (JSON) | Lưu dạng JSON array |
| `Embedded[]` | **(Tách bảng)** | **(Tách bảng)** | Tạo bảng 1-n riêng |

---

## PHẦN 5: SCRIPT SQL ĐẦY ĐỦ

### **5.1. MySQL - Cập nhật bảng có sẵn**

```sql
-- ==========================================
-- Bảng: nha_tuyen_dung
-- ==========================================
ALTER TABLE nha_tuyen_dung ADD COLUMN (
  ma_so_thue VARCHAR(20),
  trang_thai_duyet ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa') DEFAULT 'cho_duyet',
  ly_do_tu_choi TEXT,
  ngay_duyet DATETIME
);

-- ==========================================
-- Bảng: ho_so_nang_luc
-- ==========================================
ALTER TABLE ho_so_nang_luc ADD COLUMN (
  -- Liên hệ
  facebook VARCHAR(255),
  github VARCHAR(255),
  portfolio_url VARCHAR(255),
  dia_diem VARCHAR(200),
  
  -- Kỹ năng (JSON)
  tom_tat_kinh_nghiem TEXT,
  ky_nang_mem TEXT,
  
  -- File CV
  file_cv_ten VARCHAR(255),
  file_cv_loai VARCHAR(50),
  file_cv_data LONGTEXT,
  file_cv_text LONGTEXT,
  file_cv_path VARCHAR(500),
  file_cv_text_status ENUM('ok', 'empty', 'gemini_pdf', 'failed') DEFAULT 'empty',
  file_cv_text_error TEXT,
  
  -- UI Template
  anh_dai_dien VARCHAR(500),
  template_cv VARCHAR(50) DEFAULT 'classic-blue',
  mau_chinh VARCHAR(20) DEFAULT '#2563eb',
  mau_phu VARCHAR(20) DEFAULT '#0f172a',
  font VARCHAR(50) DEFAULT 'Inter',
  
  -- AI
  markdown_goc LONGTEXT,
  ghi_chu_ai TEXT
);
```

-- ==========================================
-- Bảng: thong_bao
-- ==========================================
ALTER TABLE thong_bao ADD COLUMN (
  da_gui TINYINT(1) DEFAULT 0,
  icon VARCHAR(50),
  mau_sac VARCHAR(20)
);

-- ==========================================
-- Bảng mới: ho_so_bai_viet
-- ==========================================
CREATE TABLE ho_so_bai_viet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  nhan VARCHAR(255),
  url VARCHAR(500),
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- ==========================================
-- Bảng mới: ho_so_du_an_chi_tiet
-- ==========================================
CREATE TABLE ho_so_du_an_chi_tiet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  ten_du_an VARCHAR(255),
  thoi_gian VARCHAR(100),
  vi_tri VARCHAR(100),
  mo_ta TEXT,
  trach_nhiem TEXT,  -- JSON array: ["Item 1", "Item 2"]
  he_dieu_hanh VARCHAR(100),
  ngon_ngu VARCHAR(100),
  framework VARCHAR(100),
  ky_thuat VARCHAR(255),
  dia_diem VARCHAR(200),
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- ==========================================
-- Bảng mới: thong_bao_hanh_dong
-- ==========================================
CREATE TABLE thong_bao_hanh_dong (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_thong_bao INT NOT NULL,
  nhan VARCHAR(100),
  url VARCHAR(500),
  loai ENUM('primary', 'secondary', 'danger') DEFAULT 'primary',
  FOREIGN KEY (ma_thong_bao) REFERENCES thong_bao(id) ON DELETE CASCADE
);
```

---

### **5.2. SQL Server - Cập nhật bảng có sẵn**

```sql
-- ==========================================
-- Bảng: nha_tuyen_dung
-- ==========================================
ALTER TABLE nha_tuyen_dung ADD
  ma_so_thue NVARCHAR(20) NULL,
  trang_thai_duyet NVARCHAR(20) DEFAULT 'cho_duyet'
    CHECK (trang_thai_duyet IN ('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa')),
  ly_do_tu_choi NVARCHAR(500) NULL,
  ngay_duyet DATETIME2 NULL;

-- ==========================================
-- Bảng: ho_so_nang_luc
-- ==========================================
ALTER TABLE ho_so_nang_luc ADD
  -- Liên hệ
  facebook NVARCHAR(255) NULL,
  github NVARCHAR(255) NULL,
  portfolio_url NVARCHAR(255) NULL,
  dia_diem NVARCHAR(200) NULL,
  
  -- Kỹ năng (JSON)
  tom_tat_kinh_nghiem NVARCHAR(MAX) NULL,
  ky_nang_mem NVARCHAR(MAX) NULL,
  
  -- File CV
  file_cv_ten NVARCHAR(255) NULL,
  file_cv_loai NVARCHAR(50) NULL,
  file_cv_data NVARCHAR(MAX) NULL,
  file_cv_text NVARCHAR(MAX) NULL,
  file_cv_path NVARCHAR(500) NULL,
  file_cv_text_status NVARCHAR(20) DEFAULT 'empty'
    CHECK (file_cv_text_status IN ('ok', 'empty', 'gemini_pdf', 'failed')),
  file_cv_text_error NVARCHAR(MAX) NULL,
  
  -- UI Template
  anh_dai_dien NVARCHAR(500) NULL,
  template_cv NVARCHAR(50) DEFAULT 'classic-blue',
  mau_chinh NVARCHAR(20) DEFAULT '#2563eb',
  mau_phu NVARCHAR(20) DEFAULT '#0f172a',
  font NVARCHAR(50) DEFAULT 'Inter',
  
  -- AI
  markdown_goc NVARCHAR(MAX) NULL,
  ghi_chu_ai NVARCHAR(MAX) NULL;
```

-- ==========================================
-- Bảng: thong_bao
-- ==========================================
ALTER TABLE thong_bao ADD
  da_gui BIT DEFAULT 0,
  icon NVARCHAR(50) NULL,
  mau_sac NVARCHAR(20) NULL;

-- ==========================================
-- Bảng mới: ho_so_bai_viet
-- ==========================================
CREATE TABLE ho_so_bai_viet (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  nhan NVARCHAR(255),
  url NVARCHAR(500),
  ngay_tao DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- ==========================================
-- Bảng mới: ho_so_du_an_chi_tiet
-- ==========================================
CREATE TABLE ho_so_du_an_chi_tiet (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  ten_du_an NVARCHAR(255),
  thoi_gian NVARCHAR(100),
  vi_tri NVARCHAR(100),
  mo_ta NVARCHAR(MAX),
  trach_nhiem NVARCHAR(MAX),  -- JSON array
  he_dieu_hanh NVARCHAR(100),
  ngon_ngu NVARCHAR(100),
  framework NVARCHAR(100),
  ky_thuat NVARCHAR(255),
  dia_diem NVARCHAR(200),
  ngay_tao DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);

-- ==========================================
-- Bảng mới: thong_bao_hanh_dong
-- ==========================================
CREATE TABLE thong_bao_hanh_dong (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ma_thong_bao INT NOT NULL,
  nhan NVARCHAR(100),
  url NVARCHAR(500),
  loai NVARCHAR(20) DEFAULT 'primary'
    CHECK (loai IN ('primary', 'secondary', 'danger')),
  FOREIGN KEY (ma_thong_bao) REFERENCES thong_bao(id) ON DELETE CASCADE
);
```

---

## PHẦN 6: SO SÁNH TRƯỚC VÀ SAU

### **6.1. Bảng nha_tuyen_dung**

#### **TRƯỚC (Thiếu 4 trường):**
```
- id
- ma_nguoi_dung
- ten_cong_ty
- mo_ta
- dia_chi
- website
- logo
- quy_mo
- nganh
```

#### **SAU (Đầy đủ):**
```
- id
- ma_nguoi_dung
- ten_cong_ty
+ ma_so_thue              ← MỚI
- mo_ta
- dia_chi
- website
- logo
- quy_mo
- nganh
+ trang_thai_duyet       ← MỚI
+ ly_do_tu_choi          ← MỚI
+ ngay_duyet             ← MỚI
```

---

### **6.2. Bảng ho_so_nang_luc**

#### **TRƯỚC (Thiếu 18 trường):**
```
- id
- ma_ung_vien
- tieu_de
- ho_ten_hien_thi
- chuc_danh
- email_lien_he
- so_dien_thoai
```

#### **SAU (Đầy đủ - 18 trường mới):**
```
- id
- ma_ung_vien
- tieu_de
- ho_ten_hien_thi
- chuc_danh
- email_lien_he
- so_dien_thoai
+ facebook               ← MỚI (1)
+ github                 ← MỚI (2)
+ portfolio_url          ← MỚI (3)
+ dia_diem               ← MỚI (4)
+ tom_tat_kinh_nghiem    ← MỚI (5) JSON
+ ky_nang_mem            ← MỚI (6) JSON
+ file_cv_ten            ← MỚI (7)
+ file_cv_loai           ← MỚI (8)
+ file_cv_data           ← MỚI (9)
+ file_cv_text           ← MỚI (10)
+ file_cv_path           ← MỚI (11)
+ file_cv_text_status    ← MỚI (12) ENUM
+ file_cv_text_error     ← MỚI (13)
+ anh_dai_dien           ← MỚI (14)
+ template_cv            ← MỚI (15)
+ mau_chinh              ← MỚI (16)
+ mau_phu                ← MỚI (17)
+ font                   ← MỚI (18)
+ markdown_goc           ← MỚI (19)
+ ghi_chu_ai             ← MỚI (20)

+ Bảng phụ: ho_so_bai_viet        ← MỚI (Embedded → Table)
+ Bảng phụ: ho_so_du_an_chi_tiet  ← MỚI (Embedded → Table)
```

---

## PHẦN 7: LƯU Ý QUAN TRỌNG

### **7.1. Xử lý Array trong SQL**

**MongoDB:**
```javascript
kyNangMem: ["Communication", "Teamwork", "Problem Solving"]
```

**Có 2 cách trong SQL:**

#### **Cách 1: Lưu dạng JSON (ĐƠN GIẢN hơn) ⭐**
```sql
-- MySQL 5.7+
ky_nang_mem TEXT  -- Lưu: '["Communication","Teamwork"]'

-- Query
SELECT JSON_EXTRACT(ky_nang_mem, '$[0]') FROM ho_so_nang_luc;
```

#### **Cách 2: Tách bảng riêng (CHUẨN hơn)**
```sql
CREATE TABLE ho_so_ky_nang_mem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT,
  ky_nang VARCHAR(100),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id)
);
```

**Khuyến nghị:** Dùng **Cách 1 (JSON)** cho đơn giản, **Cách 2 (Table)** nếu cần query phức tạp.


---

### **7.2. Xử lý Enum trong SQL**

**MongoDB:**
```javascript
trangThaiDuyet: {
  type: String,
  enum: ['cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa']
}
```

#### **MySQL:**
```sql
trang_thai_duyet ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa') DEFAULT 'cho_duyet'
```

#### **SQL Server (không có ENUM):**
```sql
trang_thai_duyet NVARCHAR(20) DEFAULT 'cho_duyet'
  CHECK (trang_thai_duyet IN ('cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa'))
```

---

### **7.3. Xử lý Embedded Documents**

**MongoDB:**
```javascript
baiVietKyThuat: [
  { nhan: "Blog 1", url: "https://..." },
  { nhan: "Blog 2", url: "https://..." }
]
```

**SQL: PHẢI tách bảng riêng**
```sql
CREATE TABLE ho_so_bai_viet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_ho_so_nang_luc INT NOT NULL,
  nhan VARCHAR(255),
  url VARCHAR(500),
  FOREIGN KEY (ma_ho_so_nang_luc) REFERENCES ho_so_nang_luc(id) ON DELETE CASCADE
);
```

**Query để lấy:**
```sql
SELECT hs.*, bv.nhan, bv.url
FROM ho_so_nang_luc hs
LEFT JOIN ho_so_bai_viet bv ON hs.id = bv.ma_ho_so_nang_luc
WHERE hs.id = 1;
```

---

## KẾT LUẬN

### ✅ **Tổng hợp chuyển đổi:**

| Bảng | MongoDB | MySQL | SQL Server |
|------|---------|-------|------------|
| **nha_tuyen_dung** | 4 trường mới | 4 cột | 4 cột |
| **ho_so_nang_luc** | 18 trường mới | 12 cột + 2 bảng phụ | 12 cột + 2 bảng phụ |
| **thong_bao** | 4 trường mới | 3 cột + 1 bảng phụ | 3 cột + 1 bảng phụ |

### 📋 **Ánh xạ kiểu dữ liệu chính:**

| MongoDB | SQL (MySQL) | SQL (SQL Server) |
|---------|-------------|------------------|
| String | VARCHAR(n) | NVARCHAR(n) |
| String (long) | TEXT, LONGTEXT | NVARCHAR(MAX) |
| Number (Int) | INT | INT |
| Number (Float) | FLOAT, DOUBLE | FLOAT |
| Boolean | TINYINT(1) | BIT |
| Date | DATETIME | DATETIME2 |
| Enum | ENUM(...) | NVARCHAR + CHECK |
| String[] | TEXT (JSON) | NVARCHAR(MAX) (JSON) |
| Embedded[] | Tách bảng 1-n | Tách bảng 1-n |
| ObjectId | INT (FK) | INT (FK) |

### 🎯 **Khuyến nghị:**

1. **Array đơn giản** (`String[]`) → Lưu dạng **JSON** trong TEXT/NVARCHAR(MAX)
2. **Embedded documents** → **Tách bảng riêng** với quan hệ 1-n
3. **Enum** → MySQL dùng `ENUM()`, SQL Server dùng `NVARCHAR + CHECK`
4. **Boolean** → MySQL dùng `TINYINT(1)`, SQL Server dùng `BIT`
5. **Text dài** → MySQL dùng `LONGTEXT`, SQL Server dùng `NVARCHAR(MAX)`

---

**File này cung cấp đầy đủ script SQL để bổ sung 26 trường mới vào hệ thống nếu chuyển từ MongoDB sang SQL!**

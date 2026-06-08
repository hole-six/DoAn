# BẢNG KIỂU DỮ LIỆU MONGODB CHO ERD
## Ánh xạ Mongoose Schema → ERD

---

## CÂU TRẢ LỜI NHANH:

### ❓ **MongoDB có cần kiểu dữ liệu chính xác hơn trong ERD không?**

**✅ CÓ - NÊN GHI RÕ RÀNG HƠN** để:
- Phân biệt `String` vs `ObjectId` (FK)
- Phân biệt `Number` (Int) vs `Number` (Float/Decimal)
- Phân biệt `Date` vs `DateTime` (ISODate)
- Phân biệt `Array` vs `Embedded Document`
- Phân biệt `Enum` vs `String` thường

---

## PHẦN 1: ÁNH XẠ MONGOOSE → ERD

### **Bảng 1.1: Kiểu dữ liệu cơ bản**

| Mongoose Schema | MongoDB BSON | ERD (Đơn giản) | ERD (Chi tiết hơn) ⭐ | Mô tả |
|----------------|--------------|----------------|----------------------|-------|
| `String` | String | `String` | `String` | Chuỗi ký tự |
| `Number` | Double/Int32/Int64 | `Number` | `Number` hoặc `Int` | Số (mặc định Double) |
| `Date` | ISODate | `Date` | `Date` hoặc `ISODate` | Ngày giờ |
| `Boolean` | Boolean | `Boolean` | `Boolean` | True/False |
| `ObjectId` | ObjectId | `ObjectId` | `ObjectId <<PK>>` hoặc `ObjectId <<FK>>` | ID MongoDB (12 bytes) |
| `Buffer` | BinData | `Buffer` | `Buffer` hoặc `Binary` | Dữ liệu nhị phân |
| `Array` | Array | `Array` | `String[]` hoặc `Array<T>` | Mảng |
| `Object` / Subdocument | Object | `Object` | `Embedded` hoặc `JSON` | Document lồng nhau |
| `Map` | Object | `Map` | `Map<String, T>` | Key-value pairs |
| `Mixed` | Any | `Mixed` | `Any` hoặc `JSON` | Kiểu linh động |

---

## PHẦN 2: ÁNH XẠ CHI TIẾT THEO TRƯỜNG HỢP

### **2.1. String - Các trường hợp đặc biệt**

| Mongoose | ERD Đơn giản | ERD Chi tiết ⭐ | Ví dụ |
|----------|--------------|----------------|-------|
| `email: String` | `String` | `String <<UNIQUE>>` | Email phải unique |
| `matKhau: String` | `String` | `String (Hashed)` | Mật khẩu đã mã hóa |
| `vaiTro: { type: String, enum: [...] }` | `String` | `Enum` hoặc `String (Enum)` | Enum values |
| `anhDaiDien: String` | `String` | `String (URL)` hoặc `String (Path)` | URL hoặc path |
| `moTa: String` | `String` | `String (Text)` hoặc `Text` | Text dài |

**Khuyến nghị cho ERD:**
```
✅ email : String <<UNIQUE>>
✅ matKhau : String (Hashed)
✅ vaiTro : Enum ['ung_vien', 'nha_tuyen_dung', 'admin']
✅ anhDaiDien : String (URL)
✅ moTa : Text
```

---

### **2.2. Number - Phân biệt Integer vs Float**

| Mongoose | MongoDB lưu | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|-------------|--------------|----------------|
| `kinhNghiem: Number` | Double | `Number` | `Int` hoặc `Number (Int)` |
| `luongMin: Number` | Double | `Number` | `Number` hoặc `Decimal` |
| `diemKhopKyNang: Number` | Double | `Number` | `Float` hoặc `Decimal` |
| `quyMo: Number` | Double | `Number` | `Int` hoặc `Number (Int)` |
| `mucDo: { type: Number, min: 1, max: 5 }` | Int32 | `Number` | `Int (1-5)` hoặc `TinyInt` |

**Khuyến nghị cho ERD:**
```
✅ kinhNghiem : Int              // Số nguyên (năm kinh nghiệm)
✅ luongMin : Number              // Float/Double (lương)
✅ diemKhopKyNang : Float         // Điểm số (0-100)
✅ quyMo : Int                    // Số nguyên (số nhân sự)
✅ mucDo : Int (1-5)              // Range constraint
```

---

### **2.3. Date - ISODate trong MongoDB**

| Mongoose | MongoDB lưu | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|-------------|--------------|----------------|
| `ngaySinh: Date` | ISODate | `Date` | `Date` hoặc `ISODate` |
| `ngayTao: Date` | ISODate | `Date` | `DateTime` hoặc `Timestamp` |
| `hanNop: Date` | ISODate | `Date` | `Date` (chỉ ngày) |
| `thoiGianBatDau: Date` | ISODate | `Date` | `DateTime` |

**Khuyến nghị cho ERD:**
```
✅ ngaySinh : Date                // Chỉ ngày (YYYY-MM-DD)
✅ ngayTao : DateTime             // Ngày + giờ
✅ hanNop : Date                  // Deadline
✅ thoiGianBatDau : DateTime      // Thời điểm cụ thể
```

**Lưu ý:** MongoDB lưu tất cả `Date` dưới dạng `ISODate` (có cả giờ), nhưng trong ERD có thể ghi `Date` hoặc `DateTime` tùy ngữ cảnh.

---

### **2.4. ObjectId - Khóa chính và khóa ngoại**

| Mongoose | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|--------------|----------------|
| `_id: ObjectId` | `ObjectId` | `ObjectId <<PK>>` |
| `maNguoiDung: { type: ObjectId, ref: 'NguoiDung' }` | `ObjectId` | `ObjectId <<FK>>` |
| `maNguoiDung: { type: ObjectId, ref: 'NguoiDung', unique: true }` | `ObjectId` | `ObjectId <<FK, UNIQUE>>` |

**Khuyến nghị cho ERD:**
```
✅ _id : ObjectId <<PK>>
✅ maNguoiDung : ObjectId <<FK>>
✅ maUngVien : ObjectId <<FK, UNIQUE>>
```

---

### **2.5. Array - Mảng các kiểu**

| Mongoose | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|--------------|----------------|
| `kyNang: [String]` | `Array` | `String[]` hoặc `Array<String>` |
| `kyNang: [ObjectId]` | `Array` | `ObjectId[]` hoặc `Array<ObjectId>` |
| `kyNang: [{ maKyNang: ObjectId, mucDo: Number }]` | `Array` | `Embedded[]` hoặc `Array<KyNangSchema>` |
| `hanhDong: [{ nhan: String, url: String }]` | `Array` | `Embedded[]` |

**Khuyến nghị cho ERD:**
```
✅ kyNangMem : String[]                    // Mảng chuỗi đơn giản
✅ portfolio : Embedded[]                  // Mảng subdocuments
✅ kyNang : Array<{ maKyNang, mucDo }>    // Mảng có cấu trúc
```

---

### **2.6. Embedded Documents - Subdocuments**

| Mongoose | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|--------------|----------------|
| `tinNhanCuoiCung: { noiDung: String, nguoiGui: ObjectId }` | `Object` | `Embedded` hoặc `JSON` |
| `tepDinhKem: [{ tenFile: String, duongDan: String }]` | `Array` | `Embedded[]` |

**Khuyến nghị cho ERD:**

**Cách 1: Ghi chung**
```
tinNhanCuoiCung : Embedded
tepDinhKem : Embedded[]
```

**Cách 2: Tạo entity riêng (trong legend)**
```
entity "TinNhanCuoiCung" <<Embedded>> {
  noiDung : String
  nguoiGui : ObjectId
  thoiGian : DateTime
}
```

---

### **2.7. Map - Key-Value pairs**

| Mongoose | ERD Đơn giản | ERD Chi tiết ⭐ |
|----------|--------------|----------------|
| `soChuaDoc: { type: Map, of: Number }` | `Map` | `Map<String, Number>` hoặc `Map<ObjectId, Int>` |

**Khuyến nghị cho ERD:**
```
✅ soChuaDoc : Map<ObjectId, Int>
```

---

## PHẦN 3: ÁP DỤNG CHO HỆ THỐNG EFFORTIT

### **3.1. Bảng nguoi_dung - Chi tiết đầy đủ**

```
entity "nguoi_dung" as NguoiDung {
  * _id : ObjectId <<PK>>
  --
  email : String <<UNIQUE>>
  matKhau : String (Hashed)
  hoTen : String
  soDienThoai : String
  vaiTro : Enum ['ung_vien', 'nha_tuyen_dung', 'admin']
  trangThai : Enum ['hoat_dong', 'tam_khoa', 'bi_khoa']
  maDatLaiMatKhauHash : String (Hashed)
  maDatLaiMatKhauHetHan : DateTime
  ngayTao : DateTime
  ngayCapNhat : DateTime
}
```

---

### **3.2. Bảng ung_vien - Chi tiết đầy đủ**

```
entity "ung_vien" as UngVien {
  * _id : ObjectId <<PK>>
  --
  maNguoiDung : ObjectId <<FK, UNIQUE>>
  ngaySinh : Date
  gioiTinh : Enum ['nam', 'nu', 'khac']
  diaChi : String
  anhDaiDien : String (URL)
  tomTat : Text
  kinhNghiem : Int
  viTriMongMuon : String
  mucLuongMongMuon : Number
  kyNang : Embedded[]
    // [{ maKyNang: ObjectId, mucDo: Int(1-5) }]
  portfolio : Embedded[]
    // [{ tenDuAn, lienKet, moTa, congNghe[] }]
  ngayTao : DateTime
  ngayCapNhat : DateTime
}
```

---

### **3.3. Bảng tin_tuyen_dung - Chi tiết đầy đủ**

```
entity "tin_tuyen_dung" as TinTuyenDung {
  * _id : ObjectId <<PK>>
  --
  maNhaTuyenDung : ObjectId <<FK>>
  tieuDe : String
  yeuCauKinhNghiem : String
  diaChi : String
  luongMin : Number
  luongMax : Number
  loaiHinh : Enum ['toan_thoi_gian', 'ban_thoi_gian', ...]
  capBac : Enum ['intern', 'fresher', 'junior', ...]
  anhDaiDien : String (URL)
  hanNop : Date
  soLuong : Int
  moTa : Text
  yeuCau : Text
  quyenLoi : Text
  luotXem : Int
  trangThai : Enum ['nhap', 'cho_duyet', 'dang_mo', ...]
  ngayDang : DateTime
  kyNang : Embedded[]
    // [{ maKyNang: ObjectId, batBuoc: Boolean }]
  ngayTao : DateTime
  ngayCapNhat : DateTime
}
```

---

### **3.4. Bảng ho_so_ung_tuyen - Chi tiết đầy đủ**

```
entity "ho_so_ung_tuyen" as HoSoUngTuyen {
  * _id : ObjectId <<PK>>
  --
  maUngVien : ObjectId <<FK>>
  maTinTuyenDung : ObjectId <<FK>>
  maHoSoNangLuc : ObjectId <<FK>>
  thuXinViec : Text
  diemKhopKyNang : Float
  trangThai : Enum ['da_nop', 'da_xem', ...]
  ngayNop : DateTime
  ngayTao : DateTime
  ngayCapNhat : DateTime
  --
  UNIQUE(maUngVien, maTinTuyenDung)
}
```

---

### **3.5. Bảng thong_bao - Chi tiết đầy đủ**

```
entity "thong_bao" as ThongBao {
  * _id : ObjectId <<PK>>
  --
  maNguoiDung : ObjectId <<FK, INDEX>>
  loai : Enum ['he_thong', 'ho_so_ung_tuyen', ...]
  tieuDe : String
  noiDung : Text
  lienKet : String (URL)
  maHoSoUngTuyen : ObjectId <<FK>>
  maLichPhongVan : ObjectId <<FK>>
  maTinTuyenDung : ObjectId <<FK>>
  daDoc : Boolean
  daGui : Boolean
  mucDoUuTien : Enum ['thap', 'trung_binh', 'cao', 'khan_cap']
  hanhDong : Embedded[]
    // [{ nhan, url, loai }]
  icon : String
  mauSac : String
  hetHan : DateTime
  ngayTao : DateTime
  ngayCapNhat : DateTime
  --
  INDEX(maNguoiDung, daDoc, ngayTao)
  TTL INDEX(hetHan)
}
```

---

### **3.6. Bảng cuoc_tro_chuyen - Chi tiết đầy đủ**

```
entity "cuoc_tro_chuyen" as CuocTroChuyenModel {
  * _id : ObjectId <<PK>>
  --
  nguoiThamGia : ObjectId[] <<FK>>
  loai : Enum ['ung_vien_nha_tuyen_dung', 'admin_support', ...]
  tenNhom : String
  moTaNhom : String
  anhNhom : String (URL)
  quanTriNhom : ObjectId[] <<FK>>
  maHoSoUngTuyen : ObjectId <<FK>>
  maTinTuyenDung : ObjectId <<FK>>
  tinNhanCuoiCung : Embedded
    // { noiDung, nguoiGui, thoiGian }
  soChuaDoc : Map<ObjectId, Int>
  daLuuTru : Boolean
  thoiGianLuuTru : DateTime
  ngayTao : DateTime
  ngayCapNhat : DateTime
  --
  INDEX(nguoiThamGia, ngayCapNhat)
}
```

---

## PHẦN 4: SO SÁNH 3 MỨC ĐỘ CHI TIẾT

### **Mức 1: Đơn giản (Ít chi tiết)**
```
email : String
kinhNghiem : Number
ngayTao : Date
kyNang : Array
```

### **Mức 2: Trung bình (Vừa phải) ⭐ KHUYẾN NGHỊ**
```
email : String <<UNIQUE>>
kinhNghiem : Int
ngayTao : DateTime
kyNang : Embedded[]
```

### **Mức 3: Chi tiết (Rất rõ ràng)**
```
email : String <<UNIQUE>>
  // Format: xxx@yyy.zzz | Validation: email
kinhNghiem : Int
  // Range: 0-50 | Unit: năm
ngayTao : DateTime
  // Auto-generated | Format: ISODate
kyNang : Array<{ maKyNang: ObjectId, mucDo: Int(1-5) }>
  // Embedded subdocument | Ref: DanhMucKyNang
```

---

## PHẦN 5: KHUYẾN NGHỊ CUỐI CÙNG

### ✅ **Cho ERD MongoDB/Mongoose:**

**Nên dùng mức chi tiết TRUNG BÌNH** (Mức 2):

```plantuml
entity "ten_bang" {
  * _id : ObjectId <<PK>>
  --
  // Khóa ngoại
  maNguoiDung : ObjectId <<FK, UNIQUE>>
  
  // String types
  email : String <<UNIQUE>>
  matKhau : String (Hashed)
  hoTen : String
  moTa : Text
  anhDaiDien : String (URL)
  
  // Number types  
  kinhNghiem : Int
  luongMin : Number
  diemKhopKyNang : Float
  
  // Date types
  ngaySinh : Date
  ngayTao : DateTime
  
  // Enum
  vaiTro : Enum ['value1', 'value2']
  
  // Boolean
  daDoc : Boolean
  
  // Array & Embedded
  kyNangMem : String[]
  kyNang : Embedded[]
  
  // Map
  soChuaDoc : Map<ObjectId, Int>
}
```

### 📊 **Bảng tổng hợp:**

| Kiểu Mongoose | ERD đơn giản | ERD chi tiết ⭐ |
|---------------|--------------|----------------|
| String | String | String, Text, String(URL), String(Hashed) |
| Number | Number | Int, Float, Number, Decimal |
| Date | Date | Date, DateTime, Timestamp |
| ObjectId | ObjectId | ObjectId <<PK>>, ObjectId <<FK>> |
| Boolean | Boolean | Boolean |
| Array | Array | String[], ObjectId[], Embedded[] |
| Object | Object | Embedded, JSON |
| Map | Map | Map<K, V> |
| Enum | Enum | Enum [values] |

---

## KẾT LUẬN

**CÓ - MongoDB cần kiểu dữ liệu chi tiết hơn trong ERD** để:

✅ Phân biệt rõ ràng Int vs Float  
✅ Phân biệt Date vs DateTime  
✅ Hiển thị FK và PK rõ ràng với ObjectId  
✅ Thể hiện Embedded vs Reference  
✅ Ghi nhận constraint (UNIQUE, INDEX)  

**Mức chi tiết KHUYẾN NGHỊ: Mức 2 (Trung bình)**

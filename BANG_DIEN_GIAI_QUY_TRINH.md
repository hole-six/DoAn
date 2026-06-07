# BẢNG DIỄN GIẢI QUY TRÌNH HOẠT ĐỘNG NGHIỆP VỤ
## HỆ THỐNG TUYỂN DỤNG VIỆC LÀM - EFFORTIT
### (Dựa trên Use Case Diagram đã thiết kế)

---

## TỔNG QUAN HỆ THỐNG

**Tên hệ thống:** EffortIT - Website tuyển dụng ngành công nghệ thông tin tại Thành phố Đà Nẵng

**Các actor chính:**
1. Khách vãng lai (Guest)
2. Ứng viên (Candidate) - kế thừa từ Khách vãng lai
3. Nhà tuyển dụng (Employer) - kế thừa từ Khách vãng lai  
4. Quản trị viên (Admin) - kế thừa từ Khách vãng lai

**Tổng số Use Case:** 25

---

## 1. QUY TRÌNH KHÁCH VÃNG LAI (GUEST WORKFLOW)

### Bảng 1.1: Diễn giải quy trình Khách vãng lai

| STT | Hoạt động | Input Data | Output Data | End User | Mối quan hệ |
|-----|-----------|------------|-------------|----------|-------------|
| 1.1 | Tìm kiếm việc làm | Từ khóa, Địa điểm, Kỹ năng, Mức lương | Danh sách tin tuyển dụng | Khách vãng lai | Base use case |
| 1.2 | Xem chi tiết tin tuyển dụng | maTinTuyenDung | Thông tin chi tiết công việc, yêu cầu, quyền lợi | Khách vãng lai | <<extend>> từ UC1.1 |
| 1.3 | Xem chi tiết công ty | maNhaTuyenDung | Thông tin công ty, đánh giá, danh sách tin tuyển dụng | Khách vãng lai | <<extend>> từ UC1.2 |
| 1.4 | Đăng ký tài khoản | Email, Mật khẩu, Họ tên, Số điện thoại, Vai trò (Ứng viên/NTD) | Tài khoản mới, Email xác thực | Khách vãng lai | Base use case |
| 1.5 | Đăng nhập | Email, Mật khẩu | Token xác thực, Thông tin người dùng | Khách vãng lai | Base use case |
| 1.6 | Quên mật khẩu | Email | Email chứa link reset mật khẩu | Khách vãng lai | <<extend>> từ UC1.5 |

---

## 2. QUY TRÌNH ỨNG VIÊN (CANDIDATE WORKFLOW)

### Bảng 2.1: Diễn giải quy trình Ứng viên

| STT | Hoạt động | Input Data | Output Data | End User | Mối quan hệ |
|-----|-----------|------------|-------------|----------|-------------|
| 2.1 | Đăng nhập | Email, Mật khẩu | Token xác thực, Thông tin ứng viên | Ứng viên | Kế thừa từ Khách vãng lai |
| 2.2 | Cập nhật thông tin tài khoản | Họ tên, Số điện thoại, Mật khẩu mới (nếu có) | Database cập nhật | Ứng viên | Base use case |
| 2.3 | Quản lý hồ sơ năng lực | CV, Kỹ năng, Kinh nghiệm, Học vấn, Dự án, Chứng chỉ, Portfolio | HoSoNangLuc (công khai/riêng tư) | Ứng viên | Base use case |
| 2.4 | Lưu việc làm | maTinTuyenDung | Database (viec_lam_da_luu) | Ứng viên | Base use case |
| 2.5 | Ứng tuyển tin tuyển dụng | maUngVien, maTinTuyenDung, Thư xin việc | HoSoUngTuyen (trangThai: da_nop) | Ứng viên | <<include>> UC2.3 (Chọn/Upload CV) |
| 2.6 | Theo dõi trạng thái ứng tuyển | maUngVien | Danh sách hồ sơ ứng tuyển (trangThai: da_nop/da_xem/dang_xet_duyet/moi_phong_van/dat/tu_choi) | Ứng viên | <<extend>> từ UC2.5 |
| 2.7 | Quản lý lịch phỏng vấn | maUngVien | Danh sách lịch phỏng vấn (Xác nhận/Đề xuất đổi/Hủy) | Ứng viên | <<extend>> từ UC2.6 |
| 2.8 | Đánh giá công ty | maNhaTuyenDung, Điểm (1-5), Nội dung, Ẩn danh (có/không) | DanhGiaCongTy (daDuyet: false) | Ứng viên | <<extend>> từ UC2.7 (Sau phỏng vấn) |

**Luồng nghiệp vụ chính:**
```
Đăng nhập → Tạo/Cập nhật Hồ sơ năng lực → Ứng tuyển (chọn CV) → Theo dõi trạng thái → Quản lý lịch phỏng vấn → Đánh giá công ty
```

---

## 3. QUY TRÌNH NHÀ TUYỂN DỤNG (EMPLOYER WORKFLOW)

### Bảng 3.1: Diễn giải quy trình Nhà tuyển dụng

| STT | Hoạt động | Input Data | Output Data | End User | Mối quan hệ |
|-----|-----------|------------|-------------|----------|-------------|
| 3.1 | Đăng nhập | Email, Mật khẩu | Token xác thực, Thông tin nhà tuyển dụng | Nhà tuyển dụng | Kế thừa từ Khách vãng lai |
| 3.2 | Cập nhật thông tin tài khoản | Họ tên, Số điện thoại, Mật khẩu mới (nếu có) | Database cập nhật | Nhà tuyển dụng | Base use case |
| 3.3 | Cập nhật hồ sơ công ty | Tên công ty, Logo, Mô tả, Website, Địa chỉ, Quy mô, Ngành nghề, Lĩnh vực | NhaTuyenDung (daXacMinh: false) | Nhà tuyển dụng | Base use case |
| 3.4 | Đăng tin tuyển dụng | Tiêu đề, Mô tả, Yêu cầu, Quyền lợi, Lương (Min-Max), Kỹ năng, Số lượng, Hạn nộp | TinTuyenDung (trangThai: cho_duyet) | Nhà tuyển dụng | <<precondition>> UC3.3 (Phải có hồ sơ công ty) |
| 3.5 | Quản lý tin tuyển dụng | maTinTuyenDung | Chỉnh sửa, Đóng/Mở tin, Xóa tin | Nhà tuyển dụng | <<extend>> từ UC3.4 |
| 3.6 | Quản lý hồ sơ ứng viên | maNhaTuyenDung | Danh sách HoSoUngTuyen (Lọc theo tin, trạng thái) | Nhà tuyển dụng | Base use case |
| 3.7 | Mời ứng viên phỏng vấn | maHoSoUngTuyen, Thời gian, Hình thức (Online/Offline), Link/Địa chỉ | LichPhongVan (trangThai: da_len_lich) | Nhà tuyển dụng | <<extend>> từ UC3.6 |
| 3.8 | Quản lý lịch phỏng vấn | maNhaTuyenDung | Danh sách lịch phỏng vấn (Xem, Sửa, Hủy) | Nhà tuyển dụng | Dùng chung với Ứng viên |
| 3.9 | Cập nhật kết quả phỏng vấn | maLichPhongVan, ketQua (Đạt/Không đạt), ghiChu | Database cập nhật, Thông báo ứng viên | Nhà tuyển dụng | <<extend>> từ UC3.8 |

**Luồng nghiệp vụ chính:**
```
Đăng nhập → Cập nhật hồ sơ công ty → Đăng tin tuyển dụng (chờ duyệt) → Quản lý tin → Quản lý hồ sơ ứng viên → Mời phỏng vấn → Cập nhật kết quả
```

---

## 4. QUY TRÌNH QUẢN TRỊ VIÊN (ADMIN WORKFLOW)

### Bảng 4.1: Diễn giải quy trình Quản trị viên

| STT | Hoạt động | Input Data | Output Data | End User | Mối quan hệ |
|-----|-----------|------------|-------------|----------|-------------|
| 4.1 | Quản lý người dùng | - | Danh sách người dùng (Tìm kiếm, Khóa/Mở khóa tài khoản) | Quản trị viên | Base use case |
| 4.2 | Duyệt hồ sơ công ty | maNhaTuyenDung | Xác minh công ty (daXacMinh: true), Thông báo NTD | Quản trị viên | Base use case |
| 4.3 | Duyệt tin tuyển dụng | maTinTuyenDung | Duyệt (trangThai: dang_mo) / Từ chối (tu_choi), Thông báo NTD | Quản trị viên | <<precondition>> UC4.2 (Công ty phải được duyệt) |
| 4.4 | Quản lý danh mục kỹ năng | - | Thêm/Sửa/Xóa kỹ năng (tenKyNang, danhMuc, icon) | Quản trị viên | Base use case |
| 4.5 | Duyệt đánh giá công ty | maDanhGia | Duyệt (daDuyet: true) / Xóa đánh giá vi phạm | Quản trị viên | <<precondition>> UC2.8 (Đánh giá của ứng viên) |
| 4.6 | Xem thống kê hệ thống | - | Dashboard (Số người dùng, Tin tuyển dụng, Hồ sơ, Phỏng vấn, Biểu đồ) | Quản trị viên | Base use case, <<extend>> UC4.5 |

**Luồng nghiệp vụ chính:**
```
Đăng nhập Admin → Duyệt hồ sơ công ty → Duyệt tin tuyển dụng → Quản lý kỹ năng → Duyệt đánh giá → Xem thống kê
```

---

## 5. TỔNG HỢP 25 USE CASE THEO ACTOR

### Bảng 5.1: Phân bổ Use Case theo Actor

| Actor | Số lượng UC | Danh sách Use Case |
|-------|-------------|-------------------|
| **Khách vãng lai** | 6 | UC1.1→UC1.6 (Tìm việc, Xem chi tiết, Đăng ký, Đăng nhập, Quên MK) |
| **Ứng viên** | 8 | UC2.1→UC2.8 (Quản lý hồ sơ, Ứng tuyển, Theo dõi, Phỏng vấn, Đánh giá) |
| **Nhà tuyển dụng** | 9 | UC3.1→UC3.9 (Cập nhật công ty, Đăng tin, Quản lý ứng viên, Phỏng vấn) |
| **Quản trị viên** | 6 | UC4.1→UC4.6 (Quản lý user, Duyệt công ty/tin/đánh giá, Thống kê) |
| **Tổng cộng** | **25** | - |

---

## 6. MỐI QUAN HỆ GIỮA CÁC USE CASE

### 6.1. Quan hệ <<include>> (Bắt buộc phải có)
- **UC2.5 (Ứng tuyển)** `<<include>>` **UC2.3 (Chọn/Upload CV)**: Phải có CV mới ứng tuyển được
- **UC2.3 (Chọn CV)** `<<extend>>` **UC2.3 (Quản lý hồ sơ năng lực)**: Có thể tạo hồ sơ mới hoặc chọn có sẵn

### 6.2. Quan hệ <<extend>> (Mở rộng tùy chọn)
- **UC1.2 (Xem chi tiết tin)** `<<extend>>` **UC1.1 (Tìm kiếm)**
- **UC1.3 (Xem công ty)** `<<extend>>` **UC1.2 (Xem tin)**
- **UC1.6 (Quên MK)** `<<extend>>` **UC1.5 (Đăng nhập)**
- **UC2.6 (Theo dõi trạng thái)** `<<extend>>` **UC2.5 (Ứng tuyển)**
- **UC2.7 (Quản lý lịch PV)** `<<extend>>` **UC2.6 (Theo dõi)**
- **UC2.8 (Đánh giá)** `<<extend>>` **UC2.7 (Lịch PV)**: Thường sau phỏng vấn
- **UC3.5 (Quản lý tin)** `<<extend>>` **UC3.4 (Đăng tin)**
- **UC3.7 (Mời PV)** `<<extend>>` **UC3.6 (Quản lý hồ sơ)**
- **UC3.9 (Cập nhật kết quả PV)** `<<extend>>` **UC3.8 (Quản lý lịch PV)**
- **UC4.6 (Thống kê)** `<<extend>>` **UC4.5 (Duyệt đánh giá)**

### 6.3. Quan hệ <<precondition>> (Điều kiện tiên quyết)
- **UC3.4 (Đăng tin)** `<<precondition>>` **UC3.3 (Cập nhật công ty)**: Phải có hồ sơ công ty trước
- **UC4.3 (Duyệt tin)** `<<precondition>>` **UC4.2 (Duyệt công ty)**: Công ty phải được xác minh
- **UC4.5 (Duyệt đánh giá)** `<<precondition>>` **UC2.8 (Đánh giá)**: Phải có đánh giá mới duyệt
- **UC2.6 (Theo dõi)** `<<precondition>>` **UC2.5 (Ứng tuyển)**: Phải ứng tuyển rồi mới theo dõi

---

## 7. LUỒNG TRẠNG THÁI CHÍNH

### 7.1. Trạng thái Hồ sơ Ứng tuyển
```
da_nop → da_xem → dang_xet_duyet → moi_phong_van → dat/tu_choi
```

### 7.2. Trạng thái Lịch Phỏng vấn
```
da_len_lich → da_xac_nhan/doi_lich/da_huy → hoan_thanh
```

### 7.3. Trạng thái Tin Tuyển dụng
```
cho_duyet → dang_mo/tu_choi → tam_dong/het_han
```

### 7.4. Xác minh Công ty
```
Chưa xác minh (false) → Admin duyệt → Đã xác minh (true)
```

---

## 8. MA TRẬN TRUY VẾT USE CASE - DATABASE

| Use Case | Collection MongoDB | CRUD Operations |
|----------|-------------------|-----------------|
| UC1.4, UC2.1, UC3.1, UC4.1 | nguoi_dung | R (Read - Đăng ký/Đăng nhập) |
| UC1.1, UC1.2 | tin_tuyen_dung | R (Tìm kiếm, Xem) |
| UC1.3 | nha_tuyen_dung | R (Xem công ty) |
| UC2.3 | ho_so_nang_luc | CRUD (Quản lý CV) |
| UC2.4 | viec_lam_da_luu | CR (Lưu việc) |
| UC2.5, UC2.6, UC3.6 | ho_so_ung_tuyen | CRUD (Ứng tuyển, Quản lý) |
| UC2.7, UC3.7, UC3.8 | lich_phong_van | CRUD (Lịch phỏng vấn) |
| UC2.8, UC4.5 | danh_gia_cong_ty | CRUD (Đánh giá) |
| UC3.3, UC4.2 | nha_tuyen_dung | CRU (Cập nhật công ty) |
| UC3.4, UC3.5, UC4.3 | tin_tuyen_dung | CRUD (Đăng tin, Duyệt) |
| UC4.4 | danh_muc_ky_nang | CRUD (Quản lý kỹ năng) |

---

## PHỤ LỤC: CÔNG NGHỆ TRIỂN KHAI

- **Backend:** Node.js, TypeScript, Express
- **Database:** MongoDB, Mongoose
- **Frontend:** React, TypeScript, Vite
- **Real-time:** Socket.IO
- **UI:** TailwindCSS, Lucide Icons
- **Authentication:** JWT
- **Modeling Tool:** PlantUML (Use Case, Activity, Sequence, Robustness Diagrams)



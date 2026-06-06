# Bảng Mô Tả Dữ Liệu ERD EffortIT

Tài liệu này mô tả các bảng/collection dữ liệu lõi phục vụ bộ usecase chính của hệ thống EffortIT. Kiểu dữ liệu dùng theo MongoDB/Mongoose để đúng với hệ thống hiện tại.

## Bảng 5.1: Collection `nguoi_dung`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã người dùng. |
| `email` | String | Bắt buộc, duy nhất | Email đăng nhập. |
| `matKhau` | String | Bắt buộc | Mật khẩu đã được mã hóa. |
| `hoTen` | String | Bắt buộc | Họ tên người dùng. |
| `soDienThoai` | String |  | Số điện thoại liên hệ. |
| `vaiTro` | Enum | `ung_vien`, `nha_tuyen_dung`, `admin` | Vai trò tài khoản. |
| `trangThai` | Enum | `hoat_dong`, `tam_khoa`, `bi_khoa` | Trạng thái hoạt động tài khoản. |
| `maDatLaiMatKhauHash` | String |  | Mã đặt lại mật khẩu đã mã hóa. |
| `maDatLaiMatKhauHetHan` | Date |  | Thời điểm hết hạn mã đặt lại mật khẩu. |
| `ngayTao` | Date | Tự sinh | Ngày tạo tài khoản. |
| `ngayCapNhat` | Date | Tự sinh | Ngày cập nhật tài khoản. |

## Bảng 5.2: Collection `ung_vien`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã hồ sơ ứng viên. |
| `maNguoiDung` | ObjectId | Khóa ngoại, duy nhất | Liên kết tới tài khoản người dùng. |
| `ngaySinh` | Date |  | Ngày sinh ứng viên. |
| `gioiTinh` | Enum | `nam`, `nu`, `khac` | Giới tính. |
| `diaChi` | String |  | Địa chỉ liên hệ. |
| `anhDaiDien` | String |  | Ảnh đại diện ứng viên. |
| `tomTat` | String |  | Tóm tắt năng lực cá nhân. |
| `kinhNghiem` | Number | Mặc định 0 | Số năm kinh nghiệm. |
| `viTriMongMuon` | String |  | Vị trí ứng viên mong muốn. |
| `mucLuongMongMuon` | Number |  | Mức lương kỳ vọng. |
| `kyNang` | Array |  | Danh sách kỹ năng của ứng viên. |
| `portfolio` | Array |  | Danh sách dự án/đường dẫn portfolio. |

## Bảng 5.3: Collection `nha_tuyen_dung`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã hồ sơ nhà tuyển dụng/công ty. |
| `maNguoiDung` | ObjectId | Khóa ngoại, duy nhất | Liên kết tới tài khoản nhà tuyển dụng. |
| `tenCongTy` | String | Bắt buộc | Tên công ty. |
| `maSoThue` | String |  | Mã số thuế. |
| `moTa` | String |  | Mô tả công ty. |
| `diaChi` | String | Mặc định Đà Nẵng | Địa chỉ công ty. |
| `website` | String |  | Website công ty. |
| `logo` | String |  | Logo công ty. |
| `quyMo` | Number |  | Quy mô nhân sự. |
| `nganh` | String |  | Ngành nghề/lĩnh vực hoạt động. |
| `trangThaiDuyet` | Enum | `cho_duyet`, `da_duyet`, `tu_choi`, `bi_khoa` | Trạng thái kiểm duyệt công ty. |
| `lyDoTuChoi` | String |  | Lý do bị từ chối nếu có. |
| `ngayDuyet` | Date |  | Ngày quản trị viên duyệt. |

## Bảng 5.4: Collection `tin_tuyen_dung`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã tin tuyển dụng. |
| `maNhaTuyenDung` | ObjectId | Khóa ngoại, bắt buộc | Công ty đăng tin. |
| `tieuDe` | String | Bắt buộc | Tiêu đề tin tuyển dụng. |
| `yeuCauKinhNghiem` | String |  | Yêu cầu kinh nghiệm. |
| `diaChi` | String | Mặc định Đà Nẵng | Địa điểm làm việc. |
| `luongMin` | Number |  | Mức lương tối thiểu. |
| `luongMax` | Number |  | Mức lương tối đa. |
| `loaiHinh` | Enum |  | Loại hình làm việc. |
| `capBac` | Enum |  | Cấp bậc tuyển dụng. |
| `anhDaiDien` | String |  | Ảnh đại diện/banner của tin. |
| `hanNop` | Date |  | Hạn nộp hồ sơ. |
| `soLuong` | Number | Mặc định 1 | Số lượng cần tuyển. |
| `moTa` | String | Bắt buộc | Mô tả công việc. |
| `yeuCau` | String | Bắt buộc | Yêu cầu ứng viên. |
| `quyenLoi` | String |  | Quyền lợi ứng viên. |
| `luotXem` | Number | Mặc định 0 | Số lượt xem tin. |
| `trangThai` | Enum | `nhap`, `cho_duyet`, `dang_mo`, `tam_dong`, `het_han`, `tu_choi` | Trạng thái tin tuyển dụng. |
| `ngayDang` | Date |  | Ngày đăng/công khai tin. |
| `kyNang` | Array |  | Danh sách kỹ năng yêu cầu. |

## Bảng 5.5: Collection `danh_muc_ky_nang`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã kỹ năng. |
| `tenKyNang` | String | Bắt buộc, duy nhất | Tên kỹ năng/công nghệ. |
| `loaiKyNang` | String | Bắt buộc | Nhóm kỹ năng. |

## Bảng 5.6: Collection `ho_so_nang_luc`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã hồ sơ năng lực. |
| `maUngVien` | ObjectId | Khóa ngoại, bắt buộc | Ứng viên sở hữu hồ sơ. |
| `tieuDe` | String | Bắt buộc | Tên hồ sơ/CV. |
| `hoTenHienThi` | String |  | Họ tên hiển thị trên CV. |
| `chucDanh` | String |  | Chức danh nghề nghiệp. |
| `emailLienHe` | String |  | Email liên hệ trong CV. |
| `soDienThoai` | String |  | Số điện thoại liên hệ. |
| `hocVan` | Array |  | Thông tin học vấn. |
| `kinhNghiemLam` | Array |  | Kinh nghiệm làm việc. |
| `kyNangLapTrinh` | Array |  | Nhóm kỹ năng lập trình. |
| `duAnChiTiet` | Array |  | Dự án chi tiết. |
| `fileCvTen` | String |  | Tên file CV đã tải lên. |
| `fileCvData` | String |  | Dữ liệu file CV. |
| `fileCvText` | String |  | Nội dung text trích xuất từ CV. |
| `loaiHoSo` | Enum | `builder`, `file_upload` | Loại hồ sơ năng lực. |
| `cvChinh` | Boolean | Mặc định false | Đánh dấu CV chính. |
| `congKhai` | Boolean | Mặc định true | Trạng thái công khai hồ sơ. |

## Bảng 5.7: Collection `ho_so_ung_tuyen`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã hồ sơ ứng tuyển. |
| `maUngVien` | ObjectId | Khóa ngoại, bắt buộc | Ứng viên nộp hồ sơ. |
| `maTinTuyenDung` | ObjectId | Khóa ngoại, bắt buộc | Tin tuyển dụng được ứng tuyển. |
| `maHoSoNangLuc` | ObjectId | Khóa ngoại | Hồ sơ năng lực dùng để ứng tuyển. |
| `thuXinViec` | String |  | Thư xin việc/ghi chú ứng tuyển. |
| `diemKhopKyNang` | Number | Mặc định 0 | Điểm khớp kỹ năng. |
| `trangThai` | Enum |  | Trạng thái xử lý hồ sơ. |
| `ngayNop` | Date | Mặc định hiện tại | Ngày nộp hồ sơ. |

## Bảng 5.8: Collection `lich_phong_van`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã lịch phỏng vấn. |
| `maHoSoUngTuyen` | ObjectId | Khóa ngoại, duy nhất | Hồ sơ ứng tuyển được mời phỏng vấn. |
| `thoiGianBatDau` | Date | Bắt buộc | Thời gian bắt đầu phỏng vấn. |
| `thoiGianKetThuc` | Date |  | Thời gian kết thúc phỏng vấn. |
| `diaChi` | String |  | Địa điểm phỏng vấn. |
| `hinhThuc` | Enum | `online`, `offline` | Hình thức phỏng vấn. |
| `linkHop` | String |  | Liên kết họp online. |
| `ghiChu` | String |  | Ghi chú lịch phỏng vấn. |
| `trangThai` | Enum |  | Trạng thái lịch phỏng vấn. |
| `ketQua` | Enum | `cho_ket_qua`, `dat`, `khong_dat` | Kết quả phỏng vấn. |

## Bảng 5.9: Collection `lich_su_ho_so_ung_tuyen`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã lịch sử hồ sơ ứng tuyển. |
| `maHoSoUngTuyen` | ObjectId | Khóa ngoại, bắt buộc | Hồ sơ ứng tuyển được ghi lịch sử. |
| `trangThaiCu` | Enum |  | Trạng thái trước khi thay đổi. |
| `trangThaiMoi` | Enum | Bắt buộc | Trạng thái sau khi thay đổi. |
| `ghiChu` | String |  | Ghi chú xử lý. |
| `maNguoiDung` | ObjectId | Khóa ngoại | Người thực hiện thay đổi. |
| `thoiGian` | Date | Mặc định hiện tại | Thời điểm ghi nhận. |

## Bảng 5.10: Collection `viec_lam_da_luu`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã bản ghi lưu việc. |
| `maNguoiDung` | ObjectId | Khóa ngoại, bắt buộc | Người dùng lưu việc làm. |
| `maTinTuyenDung` | ObjectId | Khóa ngoại, bắt buộc | Tin tuyển dụng được lưu. |
| `ngayLuu` | Date | Mặc định hiện tại | Ngày lưu việc làm. |

## Bảng 5.11: Collection `danh_gia_cong_ty`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã đánh giá công ty. |
| `maUngVien` | ObjectId | Khóa ngoại, bắt buộc | Ứng viên viết đánh giá. |
| `maNhaTuyenDung` | ObjectId | Khóa ngoại, bắt buộc | Công ty được đánh giá. |
| `diem` | Number | Bắt buộc, từ 1 đến 5 | Điểm đánh giá. |
| `noiDung` | String | Bắt buộc | Nội dung nhận xét. |
| `anDanh` | Boolean | Mặc định false | Có ẩn danh người đánh giá hay không. |
| `daDuyet` | Boolean | Mặc định false | Trạng thái duyệt đánh giá. |

## Bảng 5.12: Collection `thong_bao`

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Khóa chính | Mã thông báo. |
| `maNguoiDung` | ObjectId | Khóa ngoại, bắt buộc | Người nhận thông báo. |
| `loai` | Enum |  | Loại thông báo nghiệp vụ. |
| `tieuDe` | String | Bắt buộc | Tiêu đề thông báo. |
| `noiDung` | String | Bắt buộc | Nội dung thông báo. |
| `lienKet` | String |  | Đường dẫn xử lý liên quan. |
| `maHoSoUngTuyen` | ObjectId | Khóa ngoại | Hồ sơ ứng tuyển liên quan. |
| `maLichPhongVan` | ObjectId | Khóa ngoại | Lịch phỏng vấn liên quan. |
| `maTinTuyenDung` | ObjectId | Khóa ngoại | Tin tuyển dụng liên quan. |
| `daDoc` | Boolean | Mặc định false | Trạng thái đã đọc. |
| `mucDoUuTien` | Enum |  | Mức độ ưu tiên thông báo. |
| `hetHan` | Date |  | Thời điểm hết hạn thông báo. |

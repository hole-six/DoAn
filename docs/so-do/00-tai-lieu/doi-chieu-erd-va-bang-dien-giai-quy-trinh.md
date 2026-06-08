# Đối chiếu ERD và diễn giải quy trình hoạt động nghiệp vụ

## 1. Nhận xét mức độ bám sát hệ thống

Sơ đồ hoạt động đang mở `25-activity-xem-thong-ke-he-thong.puml` bám đúng chức năng **quản trị viên xem thống kê hệ thống** của hệ thống EffortIT hiện tại. Luồng này lấy dữ liệu từ các nhóm chính: `nguoi_dung`, `nha_tuyen_dung`, `tin_tuyen_dung`, `ho_so_ung_tuyen` và dữ liệu cảnh báo vận hành được backend tính toán định kỳ.

Tuy nhiên, sơ đồ này chỉ mô tả **một chức năng quản trị**, chưa đại diện cho toàn bộ quy trình nghiệp vụ của hệ thống. Nếu cần diễn giải toàn hệ thống thì phải bổ sung các luồng lớn: khách vãng lai tìm việc/xem công ty, ứng viên tạo CV và ứng tuyển, nhà tuyển dụng đăng tin/quản lý hồ sơ/phỏng vấn, quản trị viên duyệt công ty/duyệt tin/duyệt đánh giá/quản lý kỹ năng.

Bảng mẫu cũ đang có nội dung “xem thông báo học bổng”, “đăng ký học bổng” nên **không bám hệ thống hiện tại**. Hệ thống hiện tại là website tuyển dụng IT, dữ liệu nghiệp vụ chính là tin tuyển dụng, hồ sơ năng lực, hồ sơ ứng tuyển, lịch phỏng vấn, đánh giá công ty, thông báo, việc làm đã lưu, chat và gợi ý việc làm AI.

## 2. Đối chiếu ERD cũ với hệ thống hiện tại

ERD cũ của bạn đã có phần lõi khá đúng, gồm các bảng: `NGUOIDUNG`, `UNGVIEN`, `NHATUYENDUNG`, `TINTUYENDUNG`, `DANHMUC_KYNANG`, `UNGVIEN_KYNANG`, `TINTUYENDUNG_KYNANG`, `HOSONANGLUC`, `HOSOUNGTUYEN`, `LICHSU_HOSOUNGTUYEN`, `LICHPHONGVAN`, `DANHGIA_CONGTY`, `THONGBAO`.

Các bảng này vẫn dùng được làm nền. Phần cần bổ sung chủ yếu là trường mới, enum trạng thái, quan hệ mới và một số bảng phát sinh từ chức năng hiện tại.

| Nhóm ERD cũ | Mức độ khớp | Cần bổ sung hoặc chỉnh sửa |
|---|---|---|
| `NGUOIDUNG` | Khớp phần lõi | Thêm `maDatLaiMatKhauHash`, `maDatLaiMatKhauHetHan`. Chuẩn hóa `vaiTro`: `ung_vien`, `nha_tuyen_dung`, `admin`; `trangThai`: `hoat_dong`, `tam_khoa`, `bi_khoa`. |
| `UNGVIEN` | Khớp phần lõi | Thêm `anhDaiDien`, `portfolio`. Nếu vẽ ERD quan hệ thì tách `portfolio` thành bảng `UNGVIEN_PORTFOLIO`. |
| `UNGVIEN_KYNANG` | Hợp lý | Trong code MongoDB là mảng nhúng `UngVien.kyNang`, nhưng khi vẽ ERD quan hệ thì giữ bảng trung gian này là đúng. |
| `NHATUYENDUNG` | Khớp phần lõi | Thêm `maSoThue`. Đổi/chuẩn hóa trạng thái duyệt thành `trangThaiDuyet`: `cho_duyet`, `da_duyet`, `tu_choi`, `bi_khoa`. |
| `TINTUYENDUNG` | Gần đúng | Bổ sung rõ `tieuDe`, `moTa`, `yeuCau`, `quyenLoi`, `anhDaiDien`, `soLuong`, `ngayDang`, `ngayTao`, `ngayCapNhat`. Chuẩn hóa `trangThai`: `nhap`, `cho_duyet`, `dang_mo`, `tam_dong`, `het_han`, `tu_choi`. |
| `TINTUYENDUNG_KYNANG` | Hợp lý | Trong code MongoDB là mảng nhúng `TinTuyenDung.kyNang`, nhưng ERD quan hệ nên giữ bảng này với `maTinTuyenDung`, `maKyNang`, `batBuoc`. |
| `DANHMUC_KYNANG` | Khớp | Thêm `ngayTao`, `ngayCapNhat`; đặt unique cho `tenKyNang`. |
| `HOSONANGLUC` | Thiếu nhiều trường | Bổ sung nhóm thông tin CV: `hoTenHienThi`, `chucDanh`, `soDienThoai`, `emailLienHe`, `facebook`, `github`, `portfolioUrl`, `diaDiem`, `anhDaiDien`, `fileCvTen`, `fileCvLoai`, `fileCvData`, `fileCvText`, `fileCvPath`, `fileCvTextStatus`, `fileCvTextError`, `loaiHoSo`, `templateCv`, `mauChinh`, `mauPhu`, `font`, `markdownGoc`, `ghiChuAi`. |
| `HOSOUNGTUYEN` | Khá khớp | Thêm/chuẩn hóa `maHoSoNangLuc`, `thuXinViec`, `diemKhopKyNang`, `trangThai`, `ngayNop`, `ngayTao`, `ngayCapNhat`; đặt unique `maUngVien + maTinTuyenDung`. |
| `LICHSU_HOSOUNGTUYEN` | Khớp | Thêm `ngayTao`, `ngayCapNhat`; dùng để ghi lại mỗi lần đổi trạng thái hồ sơ ứng tuyển. |
| `LICHPHONGVAN` | Gần đúng | Thêm `linkHop`, `ngayCapNhat`; chuẩn hóa `hinhThuc`: `online`, `offline`; `trangThai`: `da_len_lich`, `da_xac_nhan`, `doi_lich`, `hoan_thanh`, `da_huy`; `ketQua`: `cho_ket_qua`, `dat`, `khong_dat`. |
| `DANHGIA_CONGTY` | Cần sửa quan hệ | Không ưu tiên nối trực tiếp bằng `maLichPV`. Hệ thống hiện tại nối đánh giá với `maHoSoUngTuyen`, đồng thời vẫn có `maUngVien`, `maNhaTuyenDung`. Thêm `anDanh`, `daDuyet`, `ngayCapNhat`, unique sparse cho `maHoSoUngTuyen`. |
| `THONGBAO` | Thiếu trường mở rộng | Thêm `maTinTuyenDung`, `daGui`, `mucDoUuTien`, `hanhDong`, `icon`, `mauSac`, `hetHan`, `ngayCapNhat`. Chuẩn hóa loại thông báo theo các nghiệp vụ: hệ thống, hồ sơ ứng tuyển, lịch phỏng vấn, tin tuyển dụng, công ty, tin nhắn, kết quả phỏng vấn. |

## 3. Bảng hoặc nhóm dữ liệu nên bổ sung vào ERD

| Bảng/nhóm dữ liệu | Lý do bổ sung | Quan hệ chính |
|---|---|---|
| `VIEC_LAM_DA_LUU` | Ứng viên có chức năng lưu/huỷ lưu việc làm. | `NGUOIDUNG` 1-n `VIEC_LAM_DA_LUU`; `TINTUYENDUNG` 1-n `VIEC_LAM_DA_LUU`. |
| `CUOC_TRO_CHUYEN` | Hệ thống có chat giữa ứng viên, nhà tuyển dụng, admin support hoặc nhóm cộng đồng. | N-n với `NGUOIDUNG`; có thể gắn `HOSOUNGTUYEN`, `TINTUYENDUNG`. |
| `TIN_NHAN` | Lưu nội dung tin nhắn, file, ảnh, tin hệ thống. | `CUOC_TRO_CHUYEN` 1-n `TIN_NHAN`; `NGUOIDUNG` 1-n `TIN_NHAN`. |
| `TINNHAN_TEPDINHKEM` | Tách mảng file đính kèm nếu vẽ ERD quan hệ chi tiết. | `TIN_NHAN` 1-n `TINNHAN_TEPDINHKEM`. |
| `TINNHAN_DADOCBOI` | Lưu trạng thái đã đọc của từng người trong cuộc trò chuyện. | `TIN_NHAN` 1-n `TINNHAN_DADOCBOI`; `NGUOIDUNG` 1-n `TINNHAN_DADOCBOI`. |
| `TINNHAN_PHANUNG` | Lưu reaction/emoji trên tin nhắn. | `TIN_NHAN` 1-n `TINNHAN_PHANUNG`; `NGUOIDUNG` 1-n `TINNHAN_PHANUNG`. |
| `GOI_Y_VIEC_LAM` | Hệ thống có chức năng AI gợi ý việc làm cho ứng viên. | `UNGVIEN` 1-n `GOI_Y_VIEC_LAM`; có thể gắn `HOSONANGLUC`. |
| `GOIYVIECLAM_KETQUA` | Một lần quét AI có nhiều tin được đề xuất, điểm và lý do khác nhau. | `GOI_Y_VIEC_LAM` 1-n `GOIYVIECLAM_KETQUA`; `TINTUYENDUNG` 1-n `GOIYVIECLAM_KETQUA`. |
| `UNGVIEN_PORTFOLIO` | Tách danh sách dự án/portfolio của ứng viên từ mảng nhúng. | `UNGVIEN` 1-n `UNGVIEN_PORTFOLIO`. |
| Các bảng con của `HOSONANGLUC` | CV hiện tại có nhiều mảng: học vấn, kinh nghiệm, chứng chỉ, dự án, kỹ năng, bài viết kỹ thuật, dự án chi tiết. | `HOSONANGLUC` 1-n các bảng con. Nếu muốn ERD gọn có thể để dạng JSON/TEXT. |

Ghi chú: `CANHBAOQUANTRI` không phải bảng lưu trong database hiện tại. Cảnh báo quản trị là dữ liệu tính toán từ `TinTuyenDung`, `NhaTuyenDung`, `HoSoUngTuyen`, `NguoiDung` và giữ snapshot trong bộ nhớ backend, nên không bắt buộc vẽ thành bảng ERD.

## 4. Lý thuyết bổ sung cho phần ERD

Hệ thống EffortIT sử dụng MongoDB kết hợp Mongoose, trong đó mỗi collection tương ứng với một nhóm nghiệp vụ chính. Các thực thể lõi gồm `NguoiDung`, `UngVien`, `NhaTuyenDung`, `TinTuyenDung`, `HoSoNangLuc`, `HoSoUngTuyen`, `LichPhongVan`, `DanhGiaCongTy`, `ThongBao` và `DanhMucKyNang`. Ngoài các thực thể truyền thống của quy trình tuyển dụng, hệ thống hiện tại còn mở rộng thêm các chức năng phục vụ trải nghiệm người dùng như lưu việc làm, chat thời gian thực và gợi ý việc làm bằng AI.

Do MongoDB cho phép lưu mảng và tài liệu con nhúng trong cùng một collection, một số dữ liệu như kỹ năng ứng viên, kỹ năng yêu cầu của tin tuyển dụng, portfolio, hành động thông báo, tệp đính kèm tin nhắn hoặc kết quả gợi ý AI đang được cài đặt dưới dạng embedded document. Khi chuyển sang ERD quan hệ để trình bày trong báo cáo, các mảng này có thể được tách thành bảng con hoặc bảng trung gian nhằm thể hiện rõ khóa ngoại, bội số quan hệ và ràng buộc dữ liệu.

Các trạng thái nghiệp vụ cần được thể hiện rõ trong ERD hoặc phần mô tả dữ liệu. Tin tuyển dụng đi qua các trạng thái `nhap`, `cho_duyet`, `dang_mo`, `tam_dong`, `het_han`, `tu_choi`. Hồ sơ ứng tuyển đi qua các trạng thái `da_nop`, `da_xem`, `dang_xet_duyet`, `moi_phong_van`, `dat`, `tu_choi`, `da_rut`. Lịch phỏng vấn có các trạng thái `da_len_lich`, `da_xac_nhan`, `doi_lich`, `hoan_thanh`, `da_huy`. Việc chuẩn hóa các trạng thái này giúp hệ thống kiểm soát luồng xử lý từ lúc ứng viên nộp hồ sơ đến khi nhà tuyển dụng cập nhật kết quả.

Về ràng buộc dữ liệu, hệ thống cần đảm bảo mỗi email chỉ tạo một tài khoản, mỗi tài khoản ứng viên hoặc nhà tuyển dụng chỉ có một hồ sơ tương ứng, mỗi ứng viên chỉ ứng tuyển một lần cho một tin tuyển dụng, mỗi hồ sơ ứng tuyển chỉ có một lịch phỏng vấn hiện tại, và mỗi hồ sơ ứng tuyển chỉ tạo tối đa một đánh giá công ty. Các ràng buộc này giúp tránh trùng lặp dữ liệu và giữ luồng tuyển dụng nhất quán.

## 5. Bảng 2.2: Diễn giải quy trình hoạt động nghiệp vụ

| STT | Hoạt động | Input Data | Output Data | End User |
|---|---|---|---|---|
| 1 | Tìm kiếm việc làm | Từ khóa, địa điểm, kỹ năng, mức lương, loại hình, cấp bậc | Danh sách tin tuyển dụng đang mở | Khách vãng lai, Ứng viên |
| 2 | Xem chi tiết tin tuyển dụng | `maTinTuyenDung` | Thông tin công việc, mô tả, yêu cầu, quyền lợi, kỹ năng, công ty đăng tuyển | Khách vãng lai, Ứng viên |
| 3 | Xem chi tiết công ty | `maNhaTuyenDung` | Hồ sơ công ty, danh sách tin tuyển dụng, đánh giá công ty đã duyệt | Khách vãng lai, Ứng viên |
| 4 | Đăng ký tài khoản | Email, mật khẩu, họ tên, số điện thoại, vai trò | Bản ghi `NguoiDung`, hồ sơ ban đầu theo vai trò | Khách vãng lai |
| 5 | Đăng nhập hệ thống | Email, mật khẩu | Access token, thông tin người dùng, phân quyền theo vai trò | Tất cả người dùng |
| 6 | Quên/đặt lại mật khẩu | Email, mã đặt lại mật khẩu, mật khẩu mới | Mã reset được lưu, mật khẩu được cập nhật | Tất cả người dùng |
| 7 | Cập nhật thông tin tài khoản | Họ tên, số điện thoại, mật khẩu mới nếu có | `NguoiDung` được cập nhật | Ứng viên, Nhà tuyển dụng, Quản trị viên |
| 8 | Cập nhật hồ sơ ứng viên | Ngày sinh, giới tính, địa chỉ, ảnh đại diện, tóm tắt, kinh nghiệm, vị trí mong muốn, lương mong muốn, kỹ năng, portfolio | Hồ sơ `UngVien` được cập nhật | Ứng viên |
| 9 | Quản lý hồ sơ năng lực/CV | Thông tin CV, học vấn, kinh nghiệm, chứng chỉ, dự án, kỹ năng, file CV, template, màu sắc, font | Bản ghi `HoSoNangLuc` | Ứng viên |
| 10 | Lưu việc làm | `maNguoiDung`, `maTinTuyenDung` | Bản ghi `ViecLamDaLuu` hoặc trạng thái bỏ lưu | Ứng viên |
| 11 | Ứng tuyển tin tuyển dụng | `maUngVien`, `maTinTuyenDung`, `maHoSoNangLuc`, thư xin việc | `HoSoUngTuyen` trạng thái `da_nop`, thông báo gửi nhà tuyển dụng | Ứng viên |
| 12 | Theo dõi trạng thái ứng tuyển | `maUngVien`, bộ lọc trạng thái | Danh sách hồ sơ ứng tuyển và lịch sử trạng thái | Ứng viên |
| 13 | Xem thông báo | `maNguoiDung`, trạng thái đọc/chưa đọc | Danh sách `ThongBao`, cập nhật `daDoc` khi người dùng đọc | Tất cả người dùng |
| 14 | Chat/trao đổi tuyển dụng | Người tham gia, nội dung tin nhắn, tệp đính kèm, ngữ cảnh hồ sơ/tin tuyển dụng | `CuocTroChuyen`, `TinNhan`, trạng thái đã đọc | Ứng viên, Nhà tuyển dụng, Quản trị viên |
| 15 | Cập nhật hồ sơ công ty | Tên công ty, mã số thuế, mô tả, địa chỉ, website, logo, quy mô, ngành | `NhaTuyenDung` chờ duyệt hoặc được cập nhật | Nhà tuyển dụng |
| 16 | Đăng tin tuyển dụng | Tiêu đề, mô tả, yêu cầu, quyền lợi, lương, địa điểm, loại hình, cấp bậc, số lượng, hạn nộp, kỹ năng | `TinTuyenDung` trạng thái `cho_duyet` hoặc `nhap` | Nhà tuyển dụng |
| 17 | Quản lý tin tuyển dụng | `maTinTuyenDung`, nội dung chỉnh sửa, trạng thái đóng/mở | Tin tuyển dụng được cập nhật | Nhà tuyển dụng |
| 18 | Quản lý hồ sơ ứng viên ứng tuyển | `maNhaTuyenDung`, `maTinTuyenDung`, bộ lọc trạng thái | Danh sách `HoSoUngTuyen`, thông tin ứng viên và CV | Nhà tuyển dụng |
| 19 | Mời ứng viên phỏng vấn | `maHoSoUngTuyen`, thời gian bắt đầu/kết thúc, hình thức, địa chỉ hoặc link họp, ghi chú | `LichPhongVan`, trạng thái hồ sơ `moi_phong_van`, thông báo gửi ứng viên | Nhà tuyển dụng |
| 20 | Quản lý lịch phỏng vấn | `maLichPhongVan`, phản hồi xác nhận/đổi lịch/hủy, thông tin cập nhật | `LichPhongVan` được cập nhật trạng thái | Ứng viên, Nhà tuyển dụng |
| 21 | Cập nhật kết quả phỏng vấn | `maLichPhongVan`, kết quả `dat`/`khong_dat`, ghi chú | `LichPhongVan` hoàn thành, `HoSoUngTuyen` chuyển `dat` hoặc `tu_choi`, thông báo gửi ứng viên | Nhà tuyển dụng |
| 22 | Đánh giá công ty | `maUngVien`, `maNhaTuyenDung`, `maHoSoUngTuyen`, điểm, nội dung, ẩn danh | `DanhGiaCongTy` trạng thái `daDuyet = false` | Ứng viên |
| 23 | Duyệt hồ sơ công ty | `maNhaTuyenDung`, quyết định duyệt/từ chối, lý do từ chối nếu có | `NhaTuyenDung.trangThaiDuyet`, thông báo kết quả cho nhà tuyển dụng | Quản trị viên |
| 24 | Duyệt tin tuyển dụng | `maTinTuyenDung`, quyết định duyệt/từ chối | `TinTuyenDung.trangThai` chuyển `dang_mo` hoặc `tu_choi`, cập nhật `ngayDang`, thông báo nhà tuyển dụng | Quản trị viên |
| 25 | Quản lý người dùng | `maNguoiDung`, bộ lọc, trạng thái tài khoản | Danh sách người dùng, tài khoản được khóa/mở khóa/cập nhật | Quản trị viên |
| 26 | Quản lý danh mục kỹ năng | Tên kỹ năng, loại kỹ năng | `DanhMucKyNang` được thêm, sửa hoặc xóa | Quản trị viên |
| 27 | Duyệt đánh giá công ty | `maDanhGia`, quyết định duyệt/xóa | `DanhGiaCongTy.daDuyet = true` hoặc đánh giá bị xóa | Quản trị viên |
| 28 | Xem thống kê hệ thống | Dữ liệu `NguoiDung`, `TinTuyenDung`, `NhaTuyenDung`, `HoSoUngTuyen`, snapshot cảnh báo | KPI tổng người dùng, việc làm đang mở, công ty chờ duyệt, ứng tuyển mới, cảnh báo vận hành | Quản trị viên |
| 29 | Gợi ý việc làm bằng AI | `maUngVien`, `maHoSoNangLuc`, dữ liệu CV và tin tuyển dụng | `GoiYViecLam`, danh sách tin phù hợp, điểm khớp, lý do gợi ý | Ứng viên |

## 6. Gợi ý sửa nội dung bảng cũ

Thay hai dòng học bổng trong bảng cũ bằng các dòng đúng nghiệp vụ:

| STT | Hoạt động cũ | Nên thay bằng |
|---|---|---|
| 1 | Xem thông báo học bổng | Xem thông báo hệ thống/tuyển dụng |
| 2 | Đăng ký học bổng | Ứng tuyển tin tuyển dụng |

Nếu bảng của chương chỉ cần mô tả quy trình chính, có thể rút gọn Bảng 2.2 còn các nhóm: tìm kiếm việc làm, đăng ký/đăng nhập, quản lý CV, ứng tuyển, theo dõi hồ sơ, phỏng vấn, đánh giá công ty, đăng tin tuyển dụng, duyệt công ty, duyệt tin, quản lý người dùng, thống kê hệ thống.

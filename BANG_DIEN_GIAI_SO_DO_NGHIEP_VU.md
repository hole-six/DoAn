# BẢNG DIỄN GIẢI SƠ ĐỒ NGHIỆP VỤ THỰC TÊ
## HỆ THỐNG TUYỂN DỤNG EFFORTIT

---

## TỔNG QUAN SƠ ĐỒ

**Loại sơ đồ:** Business Process Diagram (Sơ đồ quy trình nghiệp vụ)  
**Swim lanes:** 3 phân hệ chính
- **Ứng viên (Candidate)**
- **Nhà tuyển dụng (Employer/Recruiter)**  
- **Quản trị viên (Admin)**

**Mục đích:** Thể hiện luồng hoạt động tổng thể từ khi ứng viên tìm việc → ứng tuyển → phỏng vấn → kết quả, bao gồm vai trò của NTD và Admin trong quy trình.

---

## PHẦN 1: LUỒNG NGHIỆP VỤ ỨNG VIÊN (SWIM LANE 1)

### Bảng 1.1: Quy trình Tìm việc và Ứng tuyển

| STT | Hoạt động | Mô tả chi tiết | Input | Output | Điều kiện/Quyết định |
|-----|-----------|----------------|-------|--------|---------------------|
| 1.1 | **Start** | Ứng viên bắt đầu quy trình | - | - | - |
| 1.2 | **Đăng nhập** | Đăng nhập vào hệ thống | Email, Mật khẩu | Token xác thực | Phải có tài khoản |
| 1.3 | **Tìm kiếm việc làm** | Tìm kiếm tin tuyển dụng theo từ khóa, kỹ năng, địa điểm | Tiêu chí tìm kiếm | Danh sách TinTuyenDung | - |
| 1.4 | **Xem chi tiết tin** | Xem thông tin chi tiết công việc | maTinTuyenDung | Thông tin tin, công ty, yêu cầu | - |
| 1.5 | **❓ Tin đang mở?** | Kiểm tra trạng thái tin tuyển dụng | trangThai tin | Đúng/Sai | trangThai = 'dang_mo' |
| 1.6 | **❓ Đã có hồ sơ UngVien?** | Kiểm tra đã hoàn thiện hồ sơ ứng viên chưa | maUngVien | Có/Không | UngVien exists |
| 1.7 | **Nhấn "Ứng tuyển ngay"** | Mở form ứng tuyển | - | Form ứng tuyển | - |
| 1.8 | **❓ Đã ứng tuyển tin này?** | Kiểm tra trùng lặp ứng tuyển | maUngVien, maTinTuyenDung | Có/Chưa | HoSoUngTuyen exists |
| 1.9 | **Chọn CV hoặc Upload CV** | Chọn HoSoNangLuc có sẵn hoặc upload file PDF mới | File CV hoặc maHoSoNangLuc | maHoSoNangLuc | Phải có CV |
| 1.10 | **Nhập thư xin việc** | Viết thư xin việc (tùy chọn) | Nội dung thư | thuXinViec | Optional |
| 1.11 | **Nhấn "Gửi ứng tuyển"** | Xác nhận gửi hồ sơ | Form data | Request gửi | - |
| 1.12 | **❓ CV hợp lệ?** | Hệ thống kiểm tra CV | maHoSoNangLuc | Hợp lệ/Không | CV phải tồn tại |
| 1.13 | **✅ Tạo HoSoUngTuyen** | Hệ thống tạo hồ sơ ứng tuyển | Data ứng tuyển | HoSoUngTuyen (trangThai: da_nop) | Nếu CV hợp lệ |
| 1.14 | **📧 Gửi thông báo cho NTD** | Hệ thống gửi ThongBao cho nhà tuyển dụng | Thông tin hồ sơ mới | ThongBao | Tự động |
| 1.15 | **Hiển thị "Ứng tuyển thành công"** | Thông báo thành công cho ứng viên | - | Message | - |
| 1.16 | **Theo dõi trạng thái ứng tuyển** | Xem danh sách hồ sơ đã nộp và trạng thái | maUngVien | Danh sách HoSoUngTuyen | - |
| 1.17 | **❓ Nhận lời mời phỏng vấn** | Nhận thông báo từ NTD | ThongBao | LichPhongVan | Nếu được mời |
| 1.18 | **Xem chi tiết lịch PV** | Xem thời gian, địa điểm, link họp | maLichPhongVan | Chi tiết lịch phỏng vấn | - |
| 1.19 | **❓ Quyết định lịch PV** | Xác nhận/Đề xuất đổi/Hủy lịch | - | da_xac_nhan/doi_lich/da_huy | - |
| 1.20 | **Cập nhật trạng thái lịch PV** | Hệ thống cập nhật LichPhongVan | trangThai mới | Database cập nhật | - |
| 1.21 | **📧 Gửi phản hồi cho NTD** | Thông báo phản hồi lịch cho NTD | Phản hồi UV | ThongBao | Tự động |
| 1.22 | **❓ Nhận kết quả phỏng vấn** | Nhận ThongBao kết quả từ NTD | ketQua (dat/khong_dat) | Thông báo kết quả | Sau phỏng vấn |
| 1.23 | **Đánh giá công ty** | Viết đánh giá về công ty (tùy chọn) | Điểm 1-5, Nội dung | DanhGiaCongTy (daDuyet: false) | Sau kết quả |
| 1.24 | **End** | Kết thúc quy trình ứng viên | - | - | - |

**Luồng chính UV:** Start → Đăng nhập → Tìm việc → Xem tin → Ứng tuyển → Theo dõi → Phỏng vấn → Kết quả → Đánh giá → End

---

## PHẦN 2: LUỒNG NGHIỆP VỤ NHÀ TUYỂN DỤNG (SWIM LANE 2)

### Bảng 2.1: Quy trình Đăng tin và Quản lý Ứng viên

| STT | Hoạt động | Mô tả chi tiết | Input | Output | Điều kiện/Quyết định |
|-----|-----------|----------------|-------|--------|---------------------|
| 2.1 | **Start** | NTD bắt đầu quy trình | - | - | - |
| 2.2 | **Đăng nhập** | Đăng nhập hệ thống | Email, Mật khẩu | Token xác thực | vaiTro: nha_tuyen_dung |
| 2.3 | **Cập nhật hồ sơ công ty** | Hoàn thiện thông tin công ty | Tên, Logo, Mô tả, Địa chỉ, Quy mô | NhaTuyenDung | Bắt buộc trước khi đăng tin |
| 2.4 | **❓ Công ty đã xác minh?** | Kiểm tra trạng thái xác minh | daXacMinh | Đã/Chưa | Admin phải duyệt |
| 2.5 | **Đăng tin tuyển dụng** | Tạo tin tuyển dụng mới | Tiêu đề, Mô tả, Yêu cầu, Lương, Kỹ năng | TinTuyenDung (trangThai: cho_duyet) | Nếu công ty đã xác minh |
| 2.6 | **📧 Gửi yêu cầu duyệt tin** | Hệ thống gửi thông báo cho Admin | Thông tin tin mới | ThongBao cho Admin | Tự động |
| 2.7 | **⏳ Chờ Admin duyệt tin** | Tin ở trạng thái chờ duyệt | - | - | Chờ Admin |
| 2.8 | **❓ Tin được duyệt?** | Nhận kết quả duyệt từ Admin | trangThai tin | dang_mo/tu_choi | Admin quyết định |
| 2.9 | **Quản lý tin tuyển dụng** | Xem, sửa, đóng/mở lại tin | maTinTuyenDung | Database cập nhật | Nếu tin được duyệt |
| 2.10 | **📥 Nhận thông báo hồ sơ mới** | Nhận ThongBao khi UV ứng tuyển | Thông tin UV mới | ThongBao | Từ UV |
| 2.11 | **Quản lý hồ sơ ứng viên** | Xem danh sách HoSoUngTuyen | maNhaTuyenDung | Danh sách hồ sơ, Lọc theo tin/trạng thái | - |
| 2.12 | **Xem chi tiết hồ sơ UV** | Xem CV, kỹ năng, kinh nghiệm, điểm khớp | maHoSoUngTuyen | Thông tin chi tiết UV | Cập nhật trangThai: da_xem |
| 2.13 | **❓ Quyết định hồ sơ** | Đánh giá hồ sơ ứng viên | - | Mời PV/Từ chối | - |
| 2.14 | **Mời ứng viên phỏng vấn** | Tạo lịch phỏng vấn | Thời gian, Hình thức, Địa chỉ/Link, Ghi chú | LichPhongVan (trangThai: da_len_lich) | Nếu chọn Mời PV |
| 2.15 | **Cập nhật HoSoUngTuyen** | Đổi trạng thái hồ sơ | trangThai: moi_phong_van | Database cập nhật | Tự động |
| 2.16 | **📧 Gửi lời mời PV cho UV** | Hệ thống gửi ThongBao | Chi tiết lịch PV | ThongBao cho UV | Tự động |
| 2.17 | **❓ Nhận phản hồi lịch PV** | UV xác nhận/đề xuất đổi/hủy | Phản hồi từ UV | da_xac_nhan/doi_lich/da_huy | Từ UV |
| 2.18 | **Quản lý lịch phỏng vấn** | Xem, sửa, xác nhận lịch | maLichPhongVan | Danh sách lịch PV | - |
| 2.19 | **Phỏng vấn ứng viên** | Tiến hành phỏng vấn (online/offline) | - | Đánh giá UV | - |
| 2.20 | **Cập nhật kết quả PV** | Nhập kết quả phỏng vấn | ketQua (dat/khong_dat), ghiChu | LichPhongVan (trangThai: hoan_thanh) | Sau phỏng vấn |
| 2.21 | **Cập nhật trạng thái hồ sơ cuối** | Cập nhật HoSoUngTuyen | trangThai: dat/tu_choi | Database cập nhật | Theo kết quả PV |
| 2.22 | **📧 Gửi kết quả cho UV** | Hệ thống gửi ThongBao kết quả | Kết quả PV, Ghi chú | ThongBao cho UV | Tự động |
| 2.23 | **End** | Kết thúc quy trình NTD | - | - | - |

**Luồng chính NTD:** Start → Đăng nhập → Cập nhật công ty → Đăng tin → Chờ duyệt → Nhận hồ sơ → Mời PV → Phỏng vấn → Kết quả → End

---

## PHẦN 3: LUỒNG NGHIỆP VỤ QUẢN TRỊ VIÊN (SWIM LANE 3)

### Bảng 3.1: Quy trình Duyệt và Quản lý

| STT | Hoạt động | Mô tả chi tiết | Input | Output | Điều kiện/Quyết định |
|-----|-----------|----------------|-------|--------|---------------------|
| 3.1 | **Start** | Admin bắt đầu quy trình | - | - | - |
| 3.2 | **Đăng nhập Admin** | Đăng nhập với quyền admin | Email admin, Mật khẩu | Token xác thực | vaiTro: admin |
| 3.3 | **Dashboard quản trị** | Xem tổng quan hệ thống | - | Thống kê, Báo cáo | - |
| 3.4 | **📥 Nhận yêu cầu duyệt công ty** | Nhận ThongBao từ NTD đăng ký | Thông tin công ty mới | ThongBao | Từ NTD |
| 3.5 | **Duyệt hồ sơ công ty** | Xem và kiểm tra thông tin công ty | maNhaTuyenDung | Thông tin công ty | - |
| 3.6 | **❓ Quyết định công ty** | Xác minh hoặc từ chối | - | Duyệt/Từ chối | - |
| 3.7 | **Cập nhật daXacMinh** | Cập nhật trạng thái xác minh | daXacMinh: true/false | Database cập nhật | - |
| 3.8 | **📧 Gửi kết quả duyệt công ty** | Thông báo kết quả cho NTD | Kết quả duyệt | ThongBao cho NTD | Tự động |
| 3.9 | **📥 Nhận yêu cầu duyệt tin** | Nhận ThongBao tin mới từ NTD | Thông tin tin tuyển dụng | ThongBao | Từ NTD |
| 3.10 | **Duyệt tin tuyển dụng** | Xem chi tiết tin, kỹ năng, yêu cầu | maTinTuyenDung | Chi tiết tin | - |
| 3.11 | **❓ Quyết định tin** | Duyệt hoặc từ chối tin | - | Duyệt/Từ chối | - |
| 3.12 | **Cập nhật trangThai tin** | Cập nhật trạng thái tin tuyển dụng | trangThai: dang_mo/tu_choi, ngayDang | Database cập nhật | - |
| 3.13 | **📧 Gửi kết quả duyệt tin** | Thông báo kết quả cho NTD | Kết quả duyệt tin | ThongBao cho NTD | Tự động |
| 3.14 | **📥 Nhận yêu cầu duyệt đánh giá** | Nhận đánh giá công ty từ UV | Đánh giá mới | DanhGiaCongTy (daDuyet: false) | Từ UV |
| 3.15 | **Duyệt đánh giá công ty** | Xem nội dung đánh giá, kiểm tra vi phạm | maDanhGia | Chi tiết đánh giá | - |
| 3.16 | **❓ Quyết định đánh giá** | Duyệt hoặc xóa đánh giá vi phạm | - | Duyệt/Xóa | - |
| 3.17 | **Cập nhật daDuyet hoặc Xóa** | Cập nhật hoặc xóa đánh giá | daDuyet: true hoặc xóa | Database cập nhật | Hiển thị công khai nếu duyệt |
| 3.18 | **Quản lý người dùng** | Xem danh sách, tìm kiếm user | - | Danh sách NguoiDung | - |
| 3.19 | **❓ Hành động user** | Khóa/Mở khóa/Xem chi tiết | maNguoiDung | - | - |
| 3.20 | **Cập nhật trangThai tài khoản** | Thay đổi trạng thái user | trangThai: hoat_dong/tam_khoa/bi_khoa | Database cập nhật | - |
| 3.21 | **Quản lý danh mục kỹ năng** | Thêm/Sửa/Xóa kỹ năng | tenKyNang, danhMuc, icon | DanhMucKyNang | - |
| 3.22 | **Xem thống kê hệ thống** | Xem báo cáo, biểu đồ | - | Dashboard (Số user, tin, hồ sơ, PV) | - |
| 3.23 | **End** | Kết thúc quy trình Admin | - | - | - |

**Luồng chính Admin:** Start → Đăng nhập → Duyệt công ty → Duyệt tin → Duyệt đánh giá → Quản lý user → Thống kê → End

---

## PHẦN 4: TƯƠNG TÁC GIỮA CÁC ACTOR (CROSS-LANE INTERACTIONS)

### Bảng 4.1: Các điểm tương tác giữa Swim Lanes

| Từ Actor | Đến Actor | Hoạt động/Sự kiện | Phương thức | Loại tương tác |
|----------|-----------|-------------------|-------------|----------------|
| **UV** | **NTD** | Gửi hồ sơ ứng tuyển | ThongBao | Tự động (hệ thống) |
| **NTD** | **UV** | Gửi lời mời phỏng vấn | ThongBao | Tự động (hệ thống) |
| **UV** | **NTD** | Phản hồi lịch phỏng vấn (Xác nhận/Đổi/Hủy) | ThongBao | Tự động (hệ thống) |
| **NTD** | **UV** | Gửi kết quả phỏng vấn | ThongBao | Tự động (hệ thống) |
| **UV** | **Admin** | Gửi đánh giá công ty (chờ duyệt) | DanhGiaCongTy | Thủ công (UV viết) |
| **NTD** | **Admin** | Yêu cầu duyệt công ty | ThongBao | Tự động (sau cập nhật) |
| **NTD** | **Admin** | Yêu cầu duyệt tin tuyển dụng | ThongBao | Tự động (sau đăng tin) |
| **Admin** | **NTD** | Thông báo kết quả duyệt công ty | ThongBao | Tự động (hệ thống) |
| **Admin** | **NTD** | Thông báo kết quả duyệt tin | ThongBao | Tự động (hệ thống) |
| **Admin** | **UV** | Khóa/Mở khóa tài khoản | Database | Thủ công (Admin) |
| **Admin** | **NTD** | Khóa/Mở khóa tài khoản | Database | Thủ công (Admin) |

---

## PHẦN 5: CÁC ĐIỂM QUYẾT ĐỊNH QUAN TRỌNG (DECISION POINTS)

### Bảng 5.1: Phân tích các nhánh quyết định

| Mã | Quyết định | Điều kiện Đúng | Điều kiện Sai | Tác động |
|----|------------|----------------|---------------|----------|
| **D1** | Tin đang mở? | Tiếp tục ứng tuyển | Hiển thị lỗi "Tin đã đóng" | Chặn ứng tuyển tin không khả dụng |
| **D2** | Đã có hồ sơ UngVien? | Cho phép ứng tuyển | Yêu cầu hoàn thiện hồ sơ | Bắt buộc có thông tin UV |
| **D3** | Đã ứng tuyển tin này? | Thông báo trùng lặp | Cho phép gửi hồ sơ | Tránh ứng tuyển trùng |
| **D4** | CV hợp lệ? | Tạo HoSoUngTuyen | Thông báo lỗi "Cần chọn CV" | Bắt buộc có CV |
| **D5** | Công ty đã xác minh? | Cho phép đăng tin | Yêu cầu chờ duyệt công ty | Kiểm soát chất lượng NTD |
| **D6** | Tin được duyệt? | trangThai: dang_mo | trangThai: tu_choi | Kiểm duyệt nội dung tin |
| **D7** | Quyết định hồ sơ UV | Mời PV hoặc Từ chối | - | NTD sàng lọc ứng viên |
| **D8** | UV phản hồi lịch PV | Xác nhận/Đổi lịch/Hủy | - | UV kiểm soát lịch trình |
| **D9** | Quyết định công ty (Admin) | daXacMinh: true | Từ chối | Xác thực công ty hợp lệ |
| **D10** | Quyết định tin (Admin) | dang_mo | tu_choi | Kiểm duyệt nội dung tin |
| **D11** | Quyết định đánh giá (Admin) | daDuyet: true | Xóa đánh giá | Lọc nội dung vi phạm |

---

## PHẦN 6: TRẠNG THÁI VÀ CHUYỂN TIẾP (STATE TRANSITIONS)

### Bảng 6.1: Luồng chuyển trạng thái HoSoUngTuyen


| Trạng thái | Actor thực hiện | Hoạt động | Trạng thái tiếp theo |
|------------|-----------------|-----------|----------------------|
| **da_nop** | Ứng viên | Gửi hồ sơ ứng tuyển | da_xem |
| **da_xem** | Nhà tuyển dụng | Xem chi tiết hồ sơ | dang_xet_duyet |
| **dang_xet_duyet** | Nhà tuyển dụng | Đánh giá hồ sơ | moi_phong_van hoặc tu_choi |
| **moi_phong_van** | Nhà tuyển dụng | Tạo lịch phỏng vấn | dat hoặc tu_choi (sau PV) |
| **dat** | Nhà tuyển dụng | Cập nhật kết quả đạt | **[END]** |
| **tu_choi** | Nhà tuyển dụng | Cập nhật kết quả từ chối | **[END]** |
| **da_rut** | Ứng viên | Rút hồ sơ (bất kỳ lúc nào) | **[END]** |

### Bảng 6.2: Luồng chuyển trạng thái LichPhongVan

| Trạng thái | Actor thực hiện | Hoạt động | Trạng thái tiếp theo |
|------------|-----------------|-----------|----------------------|
| **da_len_lich** | Nhà tuyển dụng | Tạo lịch phỏng vấn | da_xac_nhan, doi_lich, hoặc da_huy |
| **da_xac_nhan** | Ứng viên | Xác nhận tham gia | hoan_thanh (sau PV) |
| **doi_lich** | Ứng viên | Đề xuất đổi lịch | da_len_lich (NTD sửa lịch) |
| **da_huy** | Ứng viên hoặc NTD | Hủy lịch phỏng vấn | **[END]** |
| **hoan_thanh** | Nhà tuyển dụng | Cập nhật kết quả PV | **[END]** |

### Bảng 6.3: Luồng chuyển trạng thái TinTuyenDung

| Trạng thái | Actor thực hiện | Hoạt động | Trạng thái tiếp theo |
|------------|-----------------|-----------|----------------------|
| **nhap** | Nhà tuyển dụng | Soạn tin (chưa gửi) | cho_duyet |
| **cho_duyet** | Nhà tuyển dụng | Gửi tin chờ duyệt | dang_mo hoặc tu_choi |
| **dang_mo** | Quản trị viên | Duyệt tin | tam_dong, het_han |
| **tu_choi** | Quản trị viên | Từ chối tin | **[END]** |
| **tam_dong** | Nhà tuyển dụng | Tạm đóng tin | dang_mo (mở lại) |
| **het_han** | Hệ thống | Tự động đóng khi quá hanNop | **[END]** |

---

## PHẦN 7: DỮ LIỆU VÀ THÔNG BÁO (DATA & NOTIFICATIONS)

### Bảng 7.1: Các loại thông báo tự động

| Loại ThongBao | Từ | Đến | Trigger | Nội dung |
|---------------|-----|-----|---------|----------|
| **ho_so_ung_tuyen** | Hệ thống | NTD | UV gửi hồ sơ | "UV [Tên] ứng tuyển vị trí [Tiêu đề tin]" |
| **lich_phong_van** | Hệ thống | UV | NTD tạo lịch | "Lời mời PV từ [Công ty] - [Thời gian]" |
| **lich_phong_van** | Hệ thống | NTD | UV xác nhận/hủy | "UV [Tên] đã [xác nhận/hủy] lịch PV" |
| **ket_qua_phong_van** | Hệ thống | UV | NTD cập nhật kết quả | "Kết quả PV: [Đạt/Không đạt]" |
| **cong_ty** | Hệ thống | NTD | Admin duyệt công ty | "Công ty đã được xác minh" |
| **tin_tuyen_dung** | Hệ thống | NTD | Admin duyệt tin | "Tin [Tiêu đề] đã [được duyệt/từ chối]" |
| **he_thong** | Admin | User | Admin thao tác | Cảnh báo, Thông báo hệ thống |

### Bảng 7.2: Dữ liệu chuyển giao giữa các Actor

| Dữ liệu | Từ Actor | Đến Actor | Qua | Mục đích |
|---------|----------|-----------|-----|----------|
| **HoSoUngTuyen** | Ứng viên | Nhà tuyển dụng | Database | Hồ sơ ứng tuyển |
| **LichPhongVan** | Nhà tuyển dụng | Ứng viên | Database + ThongBao | Lịch phỏng vấn |
| **Phản hồi lịch** | Ứng viên | Nhà tuyển dụng | Database + ThongBao | Xác nhận/Đổi/Hủy lịch |
| **KetQua PV** | Nhà tuyển dụng | Ứng viên | Database + ThongBao | Kết quả phỏng vấn |
| **DanhGiaCongTy** | Ứng viên | Quản trị viên | Database | Đánh giá chờ duyệt |
| **NhaTuyenDung** | Nhà tuyển dụng | Quản trị viên | Database | Hồ sơ công ty chờ duyệt |
| **TinTuyenDung** | Nhà tuyển dụng | Quản trị viên | Database | Tin chờ duyệt |
| **Kết quả duyệt** | Quản trị viên | Nhà tuyển dụng | Database + ThongBao | Kết quả duyệt công ty/tin |

---

## PHẦN 8: ĐIỂM BẮT ĐẦU VÀ KẾT THÚC (START/END POINTS)

### Bảng 8.1: Các điểm bắt đầu và kết thúc của từng Actor

| Actor | Điểm bắt đầu (Start) | Điểm kết thúc (End) | Điều kiện End |
|-------|---------------------|---------------------|---------------|
| **Ứng viên** | Đăng nhập hệ thống | Sau khi: Nhận kết quả PV + Đánh giá công ty (tùy chọn) | Hoàn thành chu trình ứng tuyển |
| **Nhà tuyển dụng** | Đăng nhập hệ thống | Sau khi: Gửi kết quả PV cho tất cả UV | Hoàn thành tuyển dụng cho tin |
| **Quản trị viên** | Đăng nhập Admin | Sau khi: Xử lý xong yêu cầu duyệt và quản lý | Hoàn thành tác vụ quản trị |

### Bảng 8.2: Các luồng phụ (Sub-flows)

| Luồng phụ | Mô tả | Kết nối với luồng chính |
|-----------|-------|-------------------------|
| **Quên mật khẩu** | UV/NTD/Admin quên mật khẩu → Reset qua email | Trước "Đăng nhập" |
| **Đăng ký tài khoản** | Khách vãng lai đăng ký tài khoản mới | Trước "Đăng nhập" |
| **Lưu việc làm** | UV lưu tin yêu thích để xem sau | Độc lập với luồng ứng tuyển |
| **Chat real-time** | UV ⇄ NTD trao đổi trực tiếp | Song song với luồng chính |
| **Xem thống kê** | Admin xem báo cáo hệ thống | Độc lập với các luồng duyệt |
| **Quản lý kỹ năng** | Admin thêm/sửa/xóa danh mục kỹ năng | Độc lập với luồng chính |

---

## PHẦN 9: CÁC NGOẠI LỆ VÀ XỬ LÝ LỖI (EXCEPTIONS)

### Bảng 9.1: Các tình huống ngoại lệ

| Tình huống ngoại lệ | Actor | Nguyên nhân | Xử lý |
|---------------------|-------|-------------|-------|
| **Tin đã đóng** | Ứng viên | Tin tuyển dụng hết hạn hoặc bị đóng | Hiển thị lỗi, không cho ứng tuyển |
| **Chưa có hồ sơ ứng viên** | Ứng viên | Chưa tạo UngVien profile | Yêu cầu hoàn thiện hồ sơ |
| **Ứng tuyển trùng lặp** | Ứng viên | Đã ứng tuyển tin này trước đó | Thông báo đã ứng tuyển |
| **CV không hợp lệ** | Ứng viên | Chưa chọn hoặc upload CV | Yêu cầu chọn/upload CV |
| **Công ty chưa xác minh** | Nhà tuyển dụng | Admin chưa duyệt công ty | Không cho đăng tin, yêu cầu chờ |
| **Tin bị từ chối** | Nhà tuyển dụng | Admin từ chối tin tuyển dụng | Thông báo lý do, yêu cầu chỉnh sửa |
| **Hồ sơ không thuộc công ty** | Nhà tuyển dụng | Cố truy cập hồ sơ của công ty khác | Chặn quyền truy cập |
| **Đã có lịch PV** | Nhà tuyển dụng | Hồ sơ đã được mời PV | Không cho tạo lịch mới, sửa lịch cũ |
| **Tài khoản bị khóa** | Tất cả user | Admin khóa tài khoản | Không cho đăng nhập |
| **Đánh giá vi phạm** | Ứng viên | Nội dung đánh giá không phù hợp | Admin xóa đánh giá |

---

## PHẦN 10: TỔNG KẾT QUY TRÌNH

### 10.1. Thống kê luồng nghiệp vụ

| Chỉ số | Giá trị |
|--------|---------|
| **Tổng số Swim Lane** | 3 (Ứng viên, Nhà tuyển dụng, Quản trị viên) |
| **Tổng số hoạt động** | ~60+ activities |
| **Số điểm quyết định** | 11 decision points |
| **Số tương tác cross-lane** | 11 interactions |
| **Số loại thông báo** | 7 loại ThongBao |
| **Số trạng thái chính** | 17 states (HoSoUngTuyen: 7, LichPhongVan: 5, TinTuyenDung: 6) |

### 10.2. Luồng nghiệp vụ tổng thể (End-to-End)

```
[UV Start] 
    → Đăng nhập 
    → Tìm việc 
    → Ứng tuyển (CV)
    ↓
[NTD nhận hồ sơ]
    ↓
[Admin duyệt tin] (nếu tin mới)
    ↓
[NTD xem hồ sơ]
    → Mời PV
    ↓
[UV nhận lời mời]
    → Xác nhận
    ↓
[Phỏng vấn]
    ↓
[NTD cập nhật kết quả]
    ↓
[UV nhận kết quả]
    → Đánh giá công ty
    ↓
[Admin duyệt đánh giá]
    ↓
[End]
```

### 10.3. Các module Database liên quan

| Collection | Sử dụng bởi Actor | CRUD Operations |
|------------|-------------------|-----------------|
| **nguoi_dung** | Tất cả | R (Đăng nhập), U (Cập nhật) |
| **ung_vien** | Ứng viên | CRUD |
| **nha_tuyen_dung** | NTD, Admin | CRUD (Admin duyệt) |
| **tin_tuyen_dung** | NTD, Admin, UV xem | CRUD (Admin duyệt) |
| **ho_so_nang_luc** | Ứng viên | CRUD |
| **ho_so_ung_tuyen** | UV, NTD | CRUD |
| **lich_phong_van** | UV, NTD | CRUD |
| **danh_gia_cong_ty** | UV, Admin | CRUD (Admin duyệt) |
| **thong_bao** | Tất cả | CR (Hệ thống tạo, User đọc) |
| **danh_muc_ky_nang** | Admin, UV/NTD xem | CRUD (Admin), R (User) |

### 10.4. Công nghệ hỗ trợ sơ đồ nghiệp vụ

- **Real-time Communication:** Socket.IO (ThongBao real-time)
- **Email Service:** Nodemailer (Thông báo quan trọng)
- **File Upload:** Multer + Sharp (CV, Avatar, Logo)
- **Authentication:** JWT + bcrypt
- **Database:** MongoDB + Mongoose
- **Frontend:** React + TailwindCSS
- **Backend:** Node.js + TypeScript + Express

---

## PHỤ LỤC: GHI CHÚ VỀ SƠ ĐỒ

**Ký hiệu trong sơ đồ:**
- ⬭ (Hình chữ nhật): Hoạt động/Activity
- ◇ (Hình thoi): Điểm quyết định/Decision
- ⬮ (Hình tròn): Start/End point
- ➞ (Mũi tên): Luồng chuyển tiếp
- 📧 (Biểu tượng): Gửi thông báo
- ⏳ (Biểu tượng): Chờ đợi/Wait
- ✅ (Biểu tượng): Tạo dữ liệu mới
- ❓ (Biểu tượng): Câu hỏi quyết định
- 📥 (Biểu tượng): Nhận dữ liệu

**Lưu ý:**
- Sơ đồ thể hiện quy trình nghiệp vụ **lý tưởng** (happy path) và các ngoại lệ chính
- Một số luồng phụ như "Quên mật khẩu", "Đăng ký" không được thể hiện chi tiết trong sơ đồ tổng thể
- Thông báo (ThongBao) được hệ thống tự động tạo và gửi, không cần user thao tác
- Admin có thể can thiệp vào bất kỳ giai đoạn nào để quản lý (khóa tài khoản, xóa nội dung vi phạm, v.v.)

---

**Ngày tạo:** [Tự động]  
**Phiên bản:** 1.0  
**Dựa trên:** Business Process Diagram - EffortIT System

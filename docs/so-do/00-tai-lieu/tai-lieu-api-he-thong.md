# Tài Liệu API Hệ Thống

## 1. Runtime Truth

- `Base URL`:
  - Dev FE mặc định: `http://localhost:5000/api`
  - Prod FE mặc định: `${window.location.origin}/api`
  - Nguồn: `frontend/src/lib/env.ts`, `backend/src/ungdung.ts`
- `API mount`: toàn bộ API runtime đang được mount tại `backend/src/dinhtuyen/apitong.ts`
- `Backend app mount`: `ungDung.use('/api', apiTong)` trong `backend/src/ungdung.ts`
- `Nguồn đối chiếu`:
  - Backend chuẩn: `backend/src/dinhtuyen/apitong.ts` + các file `backend/src/modules/*/*.dinhtuyen.ts`
  - Postman đầy đủ: `EffortIT_Postman_Collection_FULL.json`
  - Collection cũ chỉ tham khảo lịch sử: `postman/IT_Recruitment_API.postman_collection.json`
- `Quy ước response`:
  - Thông dụng nhất: `{ duLieu: ... }`
  - Một số endpoint trả thêm `thongBao`
  - Một số endpoint trả `204 No Content`
  - Một số controller cũ trả thêm `thanhCong`

## 2. Quy Ước Role

| Role | Ý nghĩa |
| --- | --- |
| `ung_vien` | Candidate |
| `nha_tuyen_dung` | Employer |
| `admin` | Administrator |

## 3. Danh Sách Group Runtime

- `Health`
- `Auth`
- `Users`
- `Candidates`
- `Candidate Profiles (CV)`
- `Employers`
- `Job Posts`
- `Saved Jobs`
- `Skill Catalog`
- `Applications`
- `Application History`
- `Interviews`
- `Notifications`
- `Messaging`
- `Company Reviews`
- `AI`
- `Admin Alerts`
- `Deploy`

---

## Health

### `GET /trangthai`

- `Path`: `/trangthai`
- `Method`: `GET`
- `Module backend`: `apiTong`
- `Route file`: `backend/src/dinhtuyen/apitong.ts`
- `Controller / service / model`: inline handler trong router; không qua controller riêng
- `Auth / role`: public
- `Purpose`: health check cơ bản để xác nhận API sẵn sàng
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ thongBao: 'API san sang', thoiGian: ISOString }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/trangthai`
- `Notes`: endpoint này nằm trực tiếp ở router gốc, không thuộc module con

---

## Auth

### `POST /xacthuc/dang-nhap`

- `Path`: `/xacthuc/dang-nhap`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.dangNhap` -> `dangNhap` trong `xacthuc.dichvu.ts` -> model người dùng
- `Auth / role`: public
- `Purpose`: đăng nhập bằng email/mật khẩu
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `email`: `string`, bắt buộc, email đăng nhập
  - `matKhau`: `string`, bắt buộc, mật khẩu
  - `vaiTro`: `ung_vien | nha_tuyen_dung | admin`, tùy chọn, dùng khi cần ép role login
- `Response shape`: `{ thongBao, duLieu }`, trong đó `duLieu` là payload đăng nhập/token/profile
- `Used by frontend`: `frontend/src/pages/xacthuc/DangNhap.tsx`
- `Postman example`: `POST {{base_url}}/xacthuc/dang-nhap`
- `Notes`: validate bởi `kiemTraDangNhap`

### `POST /xacthuc/dang-nhap-google`

- `Path`: `/xacthuc/dang-nhap-google`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.dangNhapGoogle` -> `dangNhapGoogle`
- `Auth / role`: public
- `Purpose`: đăng nhập bằng Google credential
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `credential`: `string`, bắt buộc, Google credential/JWT
  - `vaiTro`: `ung_vien | nha_tuyen_dung | admin`, tùy chọn
- `Response shape`: `{ thongBao, duLieu }`
- `Used by frontend`: `frontend/src/pages/xacthuc/DangNhap.tsx`
- `Postman example`: `POST {{base_url}}/xacthuc/dang-nhap-google`
- `Notes`: validate bởi `kiemTraDangNhapGoogle`

### `POST /xacthuc/lam-moi-token`

- `Path`: `/xacthuc/lam-moi-token`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.lamMoiToken` -> `lamMoiToken`
- `Auth / role`: public, dựa vào refresh token
- `Purpose`: cấp access token mới
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `refreshToken`: `string`, bắt buộc
- `Response shape`: `{ thongBao, duLieu }`
- `Used by frontend`: `frontend/src/lib/auth.ts`
- `Postman example`: `POST {{base_url}}/xacthuc/lam-moi-token`
- `Notes`: validate bởi `kiemTraLamMoiToken`

### `POST /xacthuc/quen-mat-khau`

- `Path`: `/xacthuc/quen-mat-khau`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.quenMatKhau` -> `quenMatKhau`
- `Auth / role`: public
- `Purpose`: tạo luồng reset password
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `email`: `string`, bắt buộc
- `Response shape`: `{ thongBao, duLieu }`
- `Used by frontend`: `frontend/src/pages/xacthuc/ForgotPasswordPage.tsx`
- `Postman example`: `POST {{base_url}}/xacthuc/quen-mat-khau`
- `Notes`: luôn nên xem `thongBao` là generic message, tránh lộ user enumeration

### `GET /xacthuc/dat-lai-mat-khau/:token`

- `Path`: `/xacthuc/dat-lai-mat-khau/:token`
- `Method`: `GET`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.kiemTraTokenDatLaiMatKhau` -> `kiemTraTokenDatLaiMatKhau`
- `Auth / role`: public
- `Purpose`: kiểm tra token reset còn hợp lệ không
- `Request params`:
  - `token`: `string`, bắt buộc
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: trang reset password có thể dùng trước submit
- `Postman example`: `GET {{base_url}}/xacthuc/dat-lai-mat-khau/:token`
- `Notes`: token phải qua kiểm tra service, không chỉ validate độ dài

### `POST /xacthuc/dat-lai-mat-khau`

- `Path`: `/xacthuc/dat-lai-mat-khau`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.datLaiMatKhau` -> `datLaiMatKhau`
- `Auth / role`: public
- `Purpose`: đặt lại mật khẩu bằng token reset
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `token`: `string`, bắt buộc, tối thiểu 32 ký tự
  - `matKhau`: `string`, bắt buộc, tối thiểu 6 ký tự
- `Response shape`: `{ thongBao, duLieu }`
- `Used by frontend`: `frontend/src/pages/xacthuc/ResetPasswordPage.tsx`
- `Postman example`: `POST {{base_url}}/xacthuc/dat-lai-mat-khau`
- `Notes`: validate bởi `kiemTraDatLaiMatKhau`

### `GET /xacthuc/toi`

- `Path`: `/xacthuc/toi`
- `Method`: `GET`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.toi` -> `layNguoiDungTuAccessToken`
- `Auth / role`: yêu cầu bearer token hợp lệ
- `Purpose`: lấy account hiện tại từ access token
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <CurrentUser> }`
- `Used by frontend`: chưa thấy page gọi trực tiếp; FE chủ yếu dùng local storage/session helper
- `Postman example`: `GET {{base_url}}/xacthuc/toi`
- `Notes`: hữu ích để đồng bộ lại profile sau login hoặc refresh token

### `POST /xacthuc/dang-xuat`

- `Path`: `/xacthuc/dang-xuat`
- `Method`: `POST`
- `Module backend`: `xacthuc`
- `Route file`: `backend/src/modules/xacthuc/xacthuc.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienXacThuc.dangXuat`
- `Auth / role`: public ở mức route; FE thường gọi khi đã có phiên
- `Purpose`: kết thúc phiên logic ở phía FE/HTTP contract
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: chưa thấy FE gọi trực tiếp, FE hiện xóa local session là chính
- `Postman example`: `POST {{base_url}}/xacthuc/dang-xuat`
- `Notes`: đây là endpoint nhẹ, không trả `duLieu`

---

## Users

### `GET /nguoidung`

- `Path`: `/nguoidung`
- `Method`: `GET`
- `Module backend`: `nguoidung`
- `Route file`: `backend/src/modules/nguoidung/nguoidung.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienNguoiDung.layDanhSach` -> `dichVuNguoiDung.layDanhSach` -> `NguoiDung`
- `Auth / role`: bắt buộc đăng nhập, `admin` only
- `Purpose`: lấy danh sách user cho admin
- `Request params`: không có
- `Query params`: Postman có `trang`, `soPhanTu`; controller hiện không khai báo filter mạnh ở route, phụ thuộc service
- `Request body`: không có
- `Response shape`: `{ duLieu: <User[]> }`
- `Used by frontend`: `frontend/src/pages/quantrivien/QuanLyNguoiDung.tsx`, `DashboardQuanTriVien.tsx`
- `Postman example`: `GET {{base_url}}/nguoidung?trang=1&soPhanTu=20`
- `Notes`: controller chặn role admin trước khi gọi service

### `GET /nguoidung/:ma`

- `Path`: `/nguoidung/:ma`
- `Method`: `GET`
- `Module backend`: `nguoidung`
- `Route file`: `backend/src/modules/nguoidung/nguoidung.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienNguoiDung.layChiTiet` -> `dichVuNguoiDung.layTheoMa` -> `NguoiDung`
- `Auth / role`: bắt buộc đăng nhập; admin xem được tất cả, user thường chỉ xem chính mình
- `Purpose`: lấy chi tiết user
- `Request params`:
  - `ma`: `string`, id user
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <User> }`
- `Used by frontend`: chủ yếu implicit qua settings/update flow; chưa thấy page detail riêng
- `Postman example`: `GET {{base_url}}/nguoidung/:ma`
- `Notes`: có kiểm tra quyền `laQuanTriVien` hoặc `laChinhChuTaiKhoan`

### `POST /nguoidung`

- `Path`: `/nguoidung`
- `Method`: `POST`
- `Module backend`: `nguoidung`
- `Route file`: `backend/src/modules/nguoidung/nguoidung.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienNguoiDung.taoMoi` -> `dichVuNguoiDung.taoMoi` -> `NguoiDung`
- `Auth / role`: public cho đăng ký self-service; nếu đã đăng nhập thì chỉ `admin` mới được tạo
- `Purpose`: tạo user account
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - Public registration schema:
    - `email`: `string`, bắt buộc
    - `matKhau`: `string`, bắt buộc, min 6
    - `hoTen`: `string`, bắt buộc, min 2
    - `soDienThoai`: `string`, tùy chọn
    - `vaiTro`: `ung_vien | nha_tuyen_dung`, tùy chọn
  - Admin schema:
    - các field ở trên
    - `trangThai`: trạng thái tài khoản, tùy chọn
    - `vaiTro`: có thể là `admin`
- `Response shape`: `{ duLieu: <User> }`, status `201`
- `Used by frontend`: `frontend/src/pages/xacthuc/DangKy.tsx`, `QuanLyNguoiDung.tsx`
- `Postman example`: `POST {{base_url}}/nguoidung`
- `Notes`: validate bằng `kiemTraTaoNguoiDung` hoặc `kiemTraTaoNguoiDungCongKhai` tùy ngữ cảnh

### `PATCH /nguoidung/:ma`

- `Path`: `/nguoidung/:ma`
- `Method`: `PATCH`
- `Module backend`: `nguoidung`
- `Route file`: `backend/src/modules/nguoidung/nguoidung.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienNguoiDung.capNhat` -> `dichVuNguoiDung.capNhat` -> `NguoiDung`
- `Auth / role`: bắt buộc đăng nhập; admin hoặc chính chủ
- `Purpose`: cập nhật account
- `Request params`:
  - `ma`: `string`, id user
- `Query params`: không có
- `Request body`:
  - Admin:
    - `email`, `matKhau`, `hoTen`, `soDienThoai`, `vaiTro`, `trangThai` đều optional
  - Self-update:
    - `hoTen`, `soDienThoai`, `matKhau`
- `Response shape`: `{ duLieu: <User> }`
- `Used by frontend`: `CaiDatQuanTriPage.tsx`, `CaiDatUngVienPage.tsx`, `QuanLyNguoiDung.tsx`
- `Postman example`: `PATCH {{base_url}}/nguoidung/:ma`
- `Notes`: phân nhánh schema update theo role

### `DELETE /nguoidung/:ma`

- `Path`: `/nguoidung/:ma`
- `Method`: `DELETE`
- `Module backend`: `nguoidung`
- `Route file`: `backend/src/modules/nguoidung/nguoidung.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienNguoiDung.xoa` -> `dichVuNguoiDung.xoa` -> `NguoiDung`
- `Auth / role`: bắt buộc đăng nhập, `admin` only
- `Purpose`: xóa user
- `Request params`:
  - `ma`: `string`, id user
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: `frontend/src/pages/quantrivien/QuanLyNguoiDung.tsx`
- `Postman example`: `DELETE {{base_url}}/nguoidung/:ma`
- `Notes`: destructive action, không có payload trả về

---

## Candidates

### `GET /ungvien/dashboard`

- `Path`: `/ungvien/dashboard`
- `Method`: `GET`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienUngVien.layDashboard` -> `dichVuUngVien.layDashboard` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: tổng hợp dashboard ứng viên
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: chưa thấy page gọi trực tiếp; FE hiện ghép dashboard bằng nhiều endpoint khác
- `Postman example`: `GET {{base_url}}/ungvien/dashboard`
- `Notes`: endpoint tồn tại thật nhưng FE hiện không phụ thuộc hoàn toàn vào nó

### `GET /ungvien/toi`

- `Path`: `/ungvien/toi`
- `Method`: `GET`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienUngVien.layHoSoCuaToi` -> `dichVuUngVien.damBaoHoSoTheoNguoiDung` hoặc `layTheoMaNguoiDung` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: lấy hồ sơ ứng viên hiện tại
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`, một số branch cũ có thể trả thêm `thanhCong`, `thongBao`
- `Used by frontend`: `frontend/src/pages/ungvien/shared/useUngVienData.ts`
- `Postman example`: `GET {{base_url}}/ungvien/toi`
- `Notes`: endpoint này hữu ích hơn `GET /ungvien/:ma` cho FE candidate

### `GET /ungvien`

- `Path`: `/ungvien`
- `Method`: `GET`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienCoBan.layDanhSach` -> `dichVuUngVien.layDanhSach` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: lấy danh sách candidate profile
- `Request params`: không có
- `Query params`: Postman có `trang`, `soPhanTu`; runtime phụ thuộc service
- `Request body`: không có
- `Response shape`: `{ duLieu: <Candidate[]> }`
- `Used by frontend`: `frontend/src/pages/vieclam/ChiTietViecLam.tsx`
- `Postman example`: `GET {{base_url}}/ungvien?trang=1&soPhanTu=20`
- `Notes`: FE công khai không dùng endpoint này; chủ yếu dashboard nội bộ

### `GET /ungvien/:ma`

- `Path`: `/ungvien/:ma`
- `Method`: `GET`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienCoBan.layChiTiet` -> `dichVuUngVien.layTheoMa` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: lấy candidate profile theo id
- `Request params`:
  - `ma`: `string`, id ứng viên
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Candidate> }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/ungvien/:ma`
- `Notes`: nếu cần profile hiện tại thì ưu tiên `/ungvien/toi`

### `POST /ungvien`

- `Path`: `/ungvien`
- `Method`: `POST`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienCoBan.taoMoi` -> `dichVuUngVien.taoMoi` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: tạo hồ sơ ứng viên
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maNguoiDung`: `string`, bắt buộc
  - `ngaySinh`: `date`, optional
  - `gioiTinh`: enum, optional
  - `diaChi`: `string`, optional
  - `anhDaiDien`: `string URL`, optional
  - `tomTat`: `string`, optional, max 1000
  - `kinhNghiem`: `number`, optional
  - `viTriMongMuon`: `string`, optional
  - `mucLuongMongMuon`: `number`, optional
  - `kyNang`: optional array `{ maKyNang, mucDo?, soNamKinhNghiem? }`
- `Response shape`: `{ duLieu: <Candidate> }`, status `201`
- `Used by frontend`: `frontend/src/pages/xacthuc/DangKy.tsx`
- `Postman example`: `POST {{base_url}}/ungvien`
- `Notes`: validate bằng `kiemTraTaoUngVien`

### `PATCH /ungvien/:ma`

- `Path`: `/ungvien/:ma`
- `Method`: `PATCH`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienUngVien.capNhatCoQuyen` -> `dichVuUngVien.capNhat` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: cập nhật hồ sơ ứng viên
- `Request params`:
  - `ma`: `string`, id ứng viên
- `Query params`: không có
- `Request body`: toàn bộ field của `POST /ungvien` đều optional
- `Response shape`: `{ duLieu, thanhCong: true, thongBao }`
- `Used by frontend`: `frontend/src/pages/ungvien/caidat/CaiDatUngVienPage.tsx`
- `Postman example`: `PATCH {{base_url}}/ungvien/:ma`
- `Notes`: route dùng version `capNhatCoQuyen`, không phải update generic thuần

### `DELETE /ungvien/:ma`

- `Path`: `/ungvien/:ma`
- `Method`: `DELETE`
- `Module backend`: `ungvien`
- `Route file`: `backend/src/modules/ungvien/ungvien.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienUngVien.xoaCoQuyen` -> `dichVuUngVien.xoa` -> `UngVien`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: xóa hồ sơ ứng viên
- `Request params`:
  - `ma`: `string`, id ứng viên
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ thanhCong: true, thongBao }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `DELETE {{base_url}}/ungvien/:ma`
- `Notes`: controller có kiểm tra quyền theo `maNguoiDung`

---

## Candidate Profiles (CV)

### `GET /hosonangluc`

- `Path`: `/hosonangluc`
- `Method`: `GET`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: generic controller `dieuKhienHoSoNangLuc` -> `dichVuHoSoNangLuc` -> `HoSoNangLuc`
- `Auth / role`: theo middleware/logic service hiện có; FE dùng trong candidate flow khi đã đăng nhập
- `Purpose`: danh sách CV/hồ sơ năng lực
- `Request params`: không có
- `Query params`: Postman có `trang`, `soPhanTu`; runtime phụ thuộc service
- `Request body`: không có
- `Response shape`: `{ duLieu: <CvProfile[]> }`
- `Used by frontend`: `useUngVienData.ts`, `ChiTietViecLam.tsx`
- `Postman example`: `GET {{base_url}}/hosonangluc?trang=1&soPhanTu=20`
- `Notes`: FE candidate hiện dùng nhiều nhất cho CV Studio

### `GET /hosonangluc/:ma`

- `Path`: `/hosonangluc/:ma`
- `Method`: `GET`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoNangLuc.layTheoMa` -> `HoSoNangLuc`
- `Auth / role`: xem theo logic service/quyền hiện tại
- `Purpose`: chi tiết một CV
- `Request params`:
  - `ma`: `string`, id CV
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <CvProfile> }`
- `Used by frontend`: chưa thấy page gọi trực tiếp
- `Postman example`: `GET {{base_url}}/hosonangluc/:ma`
- `Notes`: thường FE đã có list và giữ local state nhiều hơn là fetch detail riêng

### `POST /hosonangluc`

- `Path`: `/hosonangluc`
- `Method`: `POST`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoNangLuc.taoMoi` -> `HoSoNangLuc`
- `Auth / role`: candidate/admin theo luồng sử dụng
- `Purpose`: tạo CV builder hoặc CV file upload
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - Bắt buộc:
    - `maUngVien`: `string`
    - `tieuDe`: `string`, min 2
  - Cấu trúc section:
    - `hocVan[]`, `kinhNghiemLam[]`, `chungChi[]`, `duAn[]`
    - mỗi item gồm `tieuDe`, `donVi`, `thoiGian`, `moTa`
  - Thông tin hiển thị:
    - `hoTenHienThi`, `chucDanh`, `soDienThoai`, `emailLienHe`, `facebook`, `github`, `portfolioUrl`, `diaDiem`
  - Kỹ năng:
    - `tomTatKinhNghiem[]`
    - `kyNangMem[]`
    - `kyNangLapTrinh[]` với item `{ nhom, muc[] }`
  - Link/portfolio:
    - `baiVietKyThuat[]` item `{ nhan, url }`
    - `duAnChiTiet[]`
  - File CV:
    - `fileCvTen`, `fileCvLoai`, `fileCvData`, `fileCvText`, `fileCvPath`, `fileCvTextStatus`, `fileCvTextError`
  - Trạng thái/trình bày:
    - `loaiHoSo`: `builder | file_upload`
    - `anhDaiDien`, `templateCv`, `mauChinh`, `mauPhu`, `font`, `markdownGoc`, `ghiChuAi`, `cvChinh`, `congKhai`
- `Response shape`: `{ duLieu: <CvProfile> }`, status `201`
- `Used by frontend`: `frontend/src/pages/ungvien/CvStudio.tsx`, `ChiTietViecLam.tsx`
- `Postman example`: `POST {{base_url}}/hosonangluc`
- `Notes`: validate bằng `kiemTraTaoHoSoNangLuc`; đây là endpoint body lớn nhất trong candidate side

### `PATCH /hosonangluc/:ma`

- `Path`: `/hosonangluc/:ma`
- `Method`: `PATCH`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoNangLuc.capNhat` -> `HoSoNangLuc`
- `Auth / role`: candidate/admin theo quyền service
- `Purpose`: cập nhật CV
- `Request params`:
  - `ma`: `string`, id CV
- `Query params`: không có
- `Request body`: toàn bộ field của `POST /hosonangluc` đều optional
- `Response shape`: `{ duLieu: <CvProfile> }`
- `Used by frontend`: `CvStudio.tsx`
- `Postman example`: `PATCH {{base_url}}/hosonangluc/:ma`
- `Notes`: FE dùng rất nhiều để autosave/chỉnh sửa CV Studio

### `DELETE /hosonangluc/:ma`

- `Path`: `/hosonangluc/:ma`
- `Method`: `DELETE`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoNangLuc.xoa` -> `HoSoNangLuc`
- `Auth / role`: candidate/admin theo quyền service
- `Purpose`: xóa CV
- `Request params`:
  - `ma`: `string`, id CV
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: `CvStudio.tsx`
- `Postman example`: `DELETE {{base_url}}/hosonangluc/:ma`
- `Notes`: destructive action

### `POST /hosonangluc/upload-anh`

- `Path`: `/hosonangluc/upload-anh`
- `Method`: `POST`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: upload handler inline trong route; model chính liên quan là `HoSoNangLuc`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | admin`
- `Purpose`: upload ảnh CV/avatar hiển thị trong CV builder
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `Content-Type`: `multipart/form-data`
  - `anh`: file bắt buộc
  - Limit: `3 MB`
  - Chỉ chấp nhận MIME `image/*`
- `Response shape`: `{ duLieu: { duongDan, url, tenTep, mimeLoai, fileCvText?, fileCvPath?, fileCvTextStatus? } }`
- `Used by frontend`: `CvStudio.tsx`
- `Postman example`: `POST {{base_url}}/hosonangluc/upload-anh`
- `Notes`: field upload thực tế là `anh`

### `POST /hosonangluc/upload-file`

- `Path`: `/hosonangluc/upload-file`
- `Method`: `POST`
- `Module backend`: `hosonangluc`
- `Route file`: `backend/src/modules/hosonangluc/hosonangluc.dinhtuyen.ts`
- `Controller / service / model`: upload handler inline; hỗ trợ extract text PDF
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | admin`
- `Purpose`: upload CV gốc dạng PDF
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `Content-Type`: `multipart/form-data`
  - `tep`: file bắt buộc
  - Limit: `10 MB`
  - Chỉ chấp nhận `.pdf` hoặc MIME `application/pdf`
- `Response shape`: `{ duLieu: { duongDan, url, tenTep, mimeLoai, fileCvText, fileCvPath, fileCvTextStatus } }`
- `Used by frontend`: `CvStudio.tsx`, `ChiTietViecLam.tsx`
- `Postman example`: `POST {{base_url}}/hosonangluc/upload-file`
- `Notes`: backend có cố gắng trích text PDF để hỗ trợ AI/search

---

## Employers

### `GET /nhatuyendung`

- `Path`: `/nhatuyendung`
- `Method`: `GET`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuNhaTuyenDung.layDanhSach` -> `NhaTuyenDung`
- `Auth / role`: public ở mức route
- `Purpose`: danh sách công ty/employer profile
- `Request params`: không có
- `Query params`:
  - Postman: `trang`, `soPhanTu`
  - Runtime/service: `tuKhoa`, `limit`
- `Request body`: không có
- `Response shape`: `{ duLieu: <Employer[]> }`
- `Used by frontend`: `DanhSachCongTy.tsx`, `HoSoCongTy.tsx`, `DashboardShell.tsx`, `useEmployerData.ts`, `DashboardQuanTriVien.tsx`
- `Postman example`: `GET {{base_url}}/nhatuyendung?trang=1&soPhanTu=20`
- `Notes`: service có join thêm thông tin `nguoiDung`

### `GET /nhatuyendung/:ma`

- `Path`: `/nhatuyendung/:ma`
- `Method`: `GET`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuNhaTuyenDung.layTheoMa` -> `NhaTuyenDung`
- `Auth / role`: public
- `Purpose`: chi tiết công ty
- `Request params`:
  - `ma`: `string`, id công ty
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Employer> }`
- `Used by frontend`: `HoSoCongTy.tsx`, `ChiTietViecLam.tsx`
- `Postman example`: `GET {{base_url}}/nhatuyendung/:ma`
- `Notes`: FE public company profile dùng endpoint này

### `POST /nhatuyendung`

- `Path`: `/nhatuyendung`
- `Method`: `POST`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuNhaTuyenDung.taoMoi` -> `NhaTuyenDung`
- `Auth / role`: route không khóa role trực tiếp; thường được dùng sau đăng ký employer
- `Purpose`: tạo employer profile/công ty
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maNguoiDung`: `string`, bắt buộc
  - `tenCongTy`: `string`, bắt buộc
  - `maSoThue`, `moTa`, `diaChi`, `website`, `logo`, `nganh`: optional
  - `quyMo`: `number`, optional
  - `trangThaiDuyet`, `lyDoTuChoi`, `ngayDuyet`: optional, nhưng chủ yếu admin/service dùng
- `Response shape`: `{ duLieu: <Employer> }`, status `201`
- `Used by frontend`: `DangKy.tsx`
- `Postman example`: `POST {{base_url}}/nhatuyendung`
- `Notes`: service sẽ gửi thông báo cho admin nếu profile ở trạng thái `cho_duyet`

### `PATCH /nhatuyendung/:ma`

- `Path`: `/nhatuyendung/:ma`
- `Method`: `PATCH`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuNhaTuyenDung.capNhat` -> `NhaTuyenDung`
- `Auth / role`: route không khóa role trực tiếp; quyền thực tế nằm ở luồng sử dụng/consumer
- `Purpose`: cập nhật company profile hoặc admin duyệt/từ chối
- `Request params`:
  - `ma`: `string`, id công ty
- `Query params`: không có
- `Request body`: toàn bộ field của `POST /nhatuyendung` đều optional
- `Response shape`: `{ duLieu: <Employer> }`
- `Used by frontend`: `CongTyNhaTuyenDungPage.tsx`, `QuanLyCongTyAdmin.tsx`
- `Postman example`: `PATCH {{base_url}}/nhatuyendung/:ma`
- `Notes`: service chặn không cho từ chối lại công ty đã duyệt và tự phát thông báo kết quả duyệt

### `DELETE /nhatuyendung/:ma`

- `Path`: `/nhatuyendung/:ma`
- `Method`: `DELETE`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuNhaTuyenDung.xoa` -> `NhaTuyenDung`
- `Auth / role`: không khóa role ngay tại route file
- `Purpose`: xóa company profile
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: `QuanLyCongTyAdmin.tsx`
- `Postman example`: `DELETE {{base_url}}/nhatuyendung/:ma`
- `Notes`: cần xem đây là điểm nên harden quyền ở backend trong tương lai

### `POST /nhatuyendung/upload-logo`

- `Path`: `/nhatuyendung/upload-logo`
- `Method`: `POST`
- `Module backend`: `nhatuyendung`
- `Route file`: `backend/src/modules/nhatuyendung/nhatuyendung.dinhtuyen.ts`
- `Controller / service / model`: upload handler inline
- `Auth / role`: hiện route không gắn auth middleware
- `Purpose`: upload logo công ty
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `Content-Type`: `multipart/form-data`
  - `logo`: file bắt buộc
  - Limit: `3 MB`
  - Chỉ chấp nhận MIME `image/*`
- `Response shape`: `{ duLieu: { duongDan, url } }`, status `201`
- `Used by frontend`: `CongTyNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/nhatuyendung/upload-logo`
- `Notes`: field upload thực tế là `logo`

---

## Job Posts

### `GET /tintuyendung`

- `Path`: `/tintuyendung`
- `Method`: `GET`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuTinTuyenDung.layDanhSach` -> `TinTuyenDung`
- `Auth / role`: public hoặc có token; service đổi `cheDo` theo role
- `Purpose`: danh sách job posts
- `Request params`: không có
- `Query params`:
  - Public/search: `tuKhoa`, `trang`, `kichThuocTrang`, `limit`, `capBac`, `loaiHinh`, `kyNang`, `loaiKyNang`
  - Postman: `trang`, `soPhanTu`
- `Request body`: không có
- `Response shape`: runtime trả object kết quả list, không chỉ array thuần trong mọi trường hợp; FE nhiều nơi xử lý `duLieu`/data list
- `Used by frontend`: trang chủ, tìm việc, chi tiết việc, search suggestions, `useEmployerData.ts`, `useUngVienData.ts`, `DashboardQuanTriVien.tsx`, admin review jobs
- `Postman example`: `GET {{base_url}}/tintuyendung?trang=1&soPhanTu=20`
- `Notes`: role `admin` tự vào `cheDo: 'admin'`, employer vào `cheDo: 'nha_tuyen_dung'`, public/candidate vào `cheDo: 'cong_khai'`

### `GET /tintuyendung/:ma`

- `Path`: `/tintuyendung/:ma`
- `Method`: `GET`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `coQuyenXemTin` + `dichVuTinTuyenDung.layTheoMa` -> `TinTuyenDung`
- `Auth / role`: public có thể xem nếu job đang mở và công ty đã duyệt; admin xem tất cả
- `Purpose`: chi tiết job post
- `Request params`:
  - `ma`: `string`, id job
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: `ChiTietViecLam.tsx`
- `Postman example`: `GET {{base_url}}/tintuyendung/:ma`
- `Notes`: employer chỉ xem được job của mình hoặc job public hợp lệ

### `POST /tintuyendung`

- `Path`: `/tintuyendung`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: `damBaoQuyenTaoTin` -> `dieuKhienTinTuyenDung.taoMoi` -> `dichVuTinTuyenDung.taoMoi` -> `TinTuyenDung`
- `Auth / role`: bắt buộc đăng nhập; `nha_tuyen_dung | admin`
- `Purpose`: tạo job post
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maNhaTuyenDung`: `string`, bắt buộc ở schema, nhưng employer flow sẽ được backend tự gán
  - `tieuDe`: `string`, bắt buộc
  - `yeuCauKinhNghiem`, `diaChi`, `quyenLoi`: optional
  - `luongMin`, `luongMax`: optional
  - `loaiHinh`, `capBac`: enum optional
  - `anhDaiDien`: optional
  - `hanNop`: `date`, optional
  - `soLuong`: `number`, optional
  - `moTa`: `string`, bắt buộc
  - `yeuCau`: `string`, bắt buộc
  - `trangThai`, `ngayDang`, `luotXem`: optional
  - `kyNang[]`: optional array `{ maKyNang, batBuoc? }`
- `Response shape`: `{ duLieu: <JobPost> }`, status `201`
- `Used by frontend`: `QuanLyTinNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung`
- `Notes`: employer tạo job sẽ bị ép `trangThai = 'cho_duyet'` và `maNhaTuyenDung` theo công ty của tài khoản

### `PATCH /tintuyendung/:ma`

- `Path`: `/tintuyendung/:ma`
- `Method`: `PATCH`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: `damBaoQuyenSuaXoaTin` -> `dieuKhienTinTuyenDung.capNhat` -> `dichVuTinTuyenDung.capNhat`
- `Auth / role`: bắt buộc đăng nhập; `nha_tuyen_dung | admin`
- `Purpose`: cập nhật nội dung job hoặc đổi trạng thái hợp lệ
- `Request params`:
  - `ma`: `string`, id job
- `Query params`: không có
- `Request body`: toàn bộ field của `POST /tintuyendung` đều optional
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: employer jobs page, admin dashboard quick approve via patch
- `Postman example`: `PATCH {{base_url}}/tintuyendung/:ma`
- `Notes`: employer không được sửa nội dung job đã duyệt, chỉ dùng action đóng/mở; admin có thể đổi trạng thái nếu workflow cho phép

### `DELETE /tintuyendung/:ma`

- `Path`: `/tintuyendung/:ma`
- `Method`: `DELETE`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: `damBaoQuyenSuaXoaTin` -> `dieuKhienTinTuyenDung.xoa` -> `dichVuTinTuyenDung.xoa`
- `Auth / role`: bắt buộc đăng nhập; `nha_tuyen_dung | admin`
- `Purpose`: xóa job post
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: employer jobs page, admin review jobs page
- `Postman example`: `DELETE {{base_url}}/tintuyendung/:ma`
- `Notes`: employer chỉ xóa được tin thuộc công ty của mình

### `POST /tintuyendung/:ma/duyet`

- `Path`: `/tintuyendung/:ma/duyet`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom set body `{ trangThai: 'dang_mo' }` -> `dieuKhienTinTuyenDung.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: duyệt job
- `Request params`:
  - `ma`: `string`, id job
- `Query params`: không có
- `Request body`: không có; backend tự set `trangThai`
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: `DuyetTinTuyenDungAdmin.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung/:ma/duyet`
- `Notes`: action chuyên biệt cho admin, nên ưu tiên hơn patch thủ công

### `POST /tintuyendung/:ma/tu-choi`

- `Path`: `/tintuyendung/:ma/tu-choi`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom set body `{ trangThai: 'tu_choi' }` -> `dieuKhienTinTuyenDung.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: từ chối job
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: `DuyetTinTuyenDungAdmin.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung/:ma/tu-choi`
- `Notes`: tương tự action approve nhưng ép trạng thái `tu_choi`

### `POST /tintuyendung/:ma/mo-lai`

- `Path`: `/tintuyendung/:ma/mo-lai`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom set body `{ trangThai: 'dang_mo' }` -> guard quyền -> `dieuKhienTinTuyenDung.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `admin | nha_tuyen_dung`
- `Purpose`: mở lại tin đã tạm đóng
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: `QuanLyTinNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung/:ma/mo-lai`
- `Notes`: employer chỉ mở lại được tin thuộc công ty mình

### `POST /tintuyendung/:ma/tam-dong`

- `Path`: `/tintuyendung/:ma/tam-dong`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: route custom set body `{ trangThai: 'tam_dong' }` -> guard quyền -> `dieuKhienTinTuyenDung.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `admin | nha_tuyen_dung`
- `Purpose`: tạm đóng tin
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <JobPost> }`
- `Used by frontend`: `QuanLyTinNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung/:ma/tam-dong`
- `Notes`: action nghiệp vụ, ưu tiên hơn patch trạng thái trực tiếp

### `POST /tintuyendung/upload-anh`

- `Path`: `/tintuyendung/upload-anh`
- `Method`: `POST`
- `Module backend`: `tintuyendung`
- `Route file`: `backend/src/modules/tintuyendung/tintuyendung.dinhtuyen.ts`
- `Controller / service / model`: upload handler inline
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung | admin`
- `Purpose`: upload ảnh cover/job image
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `Content-Type`: `multipart/form-data`
  - `anh`: file bắt buộc
  - Limit: `5 MB`
  - Chỉ chấp nhận MIME `image/*`
- `Response shape`: `{ duLieu: { duongDan, url } }`, status `201`
- `Used by frontend`: `JobModal.tsx`
- `Postman example`: `POST {{base_url}}/tintuyendung/upload-anh`
- `Notes`: field upload thực tế là `anh`

---

## Saved Jobs

### `GET /viec-lam-da-luu`

- `Path`: `/viec-lam-da-luu`
- `Method`: `GET`
- `Module backend`: `vieclamdaluu`
- `Route file`: `backend/src/modules/vieclamdaluu/vieclamdaluu.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuViecLamDaLuu.layDanhSach` -> `ViecLamDaLuu`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: danh sách job đã lưu của candidate
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ thongBao, duLieu: <SavedJob[]> }`
- `Used by frontend`: `TimKiemViecLam.tsx`, `ChiTietViecLam.tsx`, `ViecDaLuuPage.tsx`
- `Postman example`: `GET {{base_url}}/viec-lam-da-luu`
- `Notes`: service lấy theo candidate hiện tại

### `POST /viec-lam-da-luu/:maTinTuyenDung`

- `Path`: `/viec-lam-da-luu/:maTinTuyenDung`
- `Method`: `POST`
- `Module backend`: `vieclamdaluu`
- `Route file`: `backend/src/modules/vieclamdaluu/vieclamdaluu.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuViecLamDaLuu.luu` -> `ViecLamDaLuu`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: lưu một job
- `Request params`:
  - `maTinTuyenDung`: `string`, id job
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ thongBao, duLieu }`, status `201`
- `Used by frontend`: `TimKiemViecLam.tsx`, `ChiTietViecLam.tsx`, `ViecDaLuuPage.tsx`
- `Postman example`: `POST {{base_url}}/viec-lam-da-luu/:maTinTuyenDung`
- `Notes`: toggle save ở FE gọi endpoint này

### `DELETE /viec-lam-da-luu/:maTinTuyenDung`

- `Path`: `/viec-lam-da-luu/:maTinTuyenDung`
- `Method`: `DELETE`
- `Module backend`: `vieclamdaluu`
- `Route file`: `backend/src/modules/vieclamdaluu/vieclamdaluu.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuViecLamDaLuu.boLuu` -> `ViecLamDaLuu`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: bỏ lưu một job
- `Request params`:
  - `maTinTuyenDung`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ thongBao, duLieu }`
- `Used by frontend`: `TimKiemViecLam.tsx`, `ChiTietViecLam.tsx`, `ViecDaLuuPage.tsx`
- `Postman example`: `DELETE {{base_url}}/viec-lam-da-luu/:maTinTuyenDung`
- `Notes`: FE thường gọi dạng toggle save/unsave

---

## Skill Catalog

### `GET /danhmuckynang`

- `Path`: `/danhmuckynang`
- `Method`: `GET`
- `Module backend`: `danhmuckynang`
- `Route file`: `backend/src/modules/danhmuckynang/danhmuckynang.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhMucKyNang.layDanhSach` -> `DanhMucKyNang`
- `Auth / role`: public ở mức route
- `Purpose`: danh sách kỹ năng chuẩn hóa
- `Request params`: không có
- `Query params`:
  - Postman: `trang`, `soPhanTu`
  - FE/search: `tuKhoa`, `limit`
- `Request body`: không có
- `Response shape`: `{ duLieu: <Skill[]> }`
- `Used by frontend`: `useUngVienData.ts`, `useEmployerData.ts`, `useSearchSuggestions.ts`, `QuanLyKyNangAdmin.tsx`
- `Postman example`: `GET {{base_url}}/danhmuckynang?trang=1&soPhanTu=50`
- `Notes`: service là CRUD cơ bản qua `taoDichVuCoBan`

### `GET /danhmuckynang/:ma`

- `Path`: `/danhmuckynang/:ma`
- `Method`: `GET`
- `Module backend`: `danhmuckynang`
- `Route file`: `backend/src/modules/danhmuckynang/danhmuckynang.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhMucKyNang.layTheoMa` -> `DanhMucKyNang`
- `Auth / role`: public
- `Purpose`: chi tiết kỹ năng
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Skill> }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/danhmuckynang/:ma`
- `Notes`: chủ yếu tiện cho debug/Postman

### `POST /danhmuckynang`

- `Path`: `/danhmuckynang`
- `Method`: `POST`
- `Module backend`: `danhmuckynang`
- `Route file`: `backend/src/modules/danhmuckynang/danhmuckynang.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhMucKyNang.taoMoi` -> `DanhMucKyNang`
- `Auth / role`: route không khóa admin trực tiếp
- `Purpose`: tạo kỹ năng
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `tenKyNang`: `string`, bắt buộc
  - `loaiKyNang`: `string`, bắt buộc
- `Response shape`: `{ duLieu: <Skill> }`, status `201`
- `Used by frontend`: `QuanLyKyNangAdmin.tsx`
- `Postman example`: `POST {{base_url}}/danhmuckynang`
- `Notes`: FE admin normalize type trước khi gửi

### `PATCH /danhmuckynang/:ma`

- `Path`: `/danhmuckynang/:ma`
- `Method`: `PATCH`
- `Module backend`: `danhmuckynang`
- `Route file`: `backend/src/modules/danhmuckynang/danhmuckynang.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhMucKyNang.capNhat` -> `DanhMucKyNang`
- `Auth / role`: route không khóa admin trực tiếp
- `Purpose`: cập nhật kỹ năng
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `tenKyNang?`
  - `loaiKyNang?`
- `Response shape`: `{ duLieu: <Skill> }`
- `Used by frontend`: `QuanLyKyNangAdmin.tsx`
- `Postman example`: `PATCH {{base_url}}/danhmuckynang/:ma`
- `Notes`: hiện schema update không có `moTa`, dù FE có thể đang giữ metadata khác

### `DELETE /danhmuckynang/:ma`

- `Path`: `/danhmuckynang/:ma`
- `Method`: `DELETE`
- `Module backend`: `danhmuckynang`
- `Route file`: `backend/src/modules/danhmuckynang/danhmuckynang.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhMucKyNang.xoa` -> `DanhMucKyNang`
- `Auth / role`: route không khóa admin trực tiếp
- `Purpose`: xóa kỹ năng
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: `QuanLyKyNangAdmin.tsx`
- `Postman example`: `DELETE {{base_url}}/danhmuckynang/:ma`
- `Notes`: cần harden auth nếu muốn endpoint admin-only thật sự

---

## Applications

### `GET /hosoungtuyen`

- `Path`: `/hosoungtuyen`
- `Method`: `GET`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoUngTuyen.layDanhSach` -> `HoSoUngTuyen`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh sách application
- `Request params`: không có
- `Query params`: Postman `trang`, `soPhanTu`; runtime phụ thuộc service/filter theo role
- `Request body`: không có
- `Response shape`: `{ duLieu: <Application[]> }`
- `Used by frontend`: `useUngVienData.ts`, `useEmployerData.ts`, `ChiTietViecLam.tsx`, `DashboardQuanTriVien.tsx`
- `Postman example`: `GET {{base_url}}/hosoungtuyen?trang=1&soPhanTu=20`
- `Notes`: role ảnh hưởng mạnh tới phạm vi dữ liệu trả về

### `GET /hosoungtuyen/:ma`

- `Path`: `/hosoungtuyen/:ma`
- `Method`: `GET`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoUngTuyen.layTheoMa` -> `HoSoUngTuyen`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: chi tiết application
- `Request params`:
  - `ma`: `string`, id application
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Application> }`
- `Used by frontend`: employer candidate page refresh detail
- `Postman example`: `GET {{base_url}}/hosoungtuyen/:ma`
- `Notes`: quyền cụ thể phụ thuộc service/dữ liệu

### `POST /hosoungtuyen`

- `Path`: `/hosoungtuyen`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuHoSoUngTuyen.taoMoi` -> `HoSoUngTuyen`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | admin`
- `Purpose`: tạo application thô bằng CRUD
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maUngVien`: `string`, bắt buộc
  - `maTinTuyenDung`: `string`, bắt buộc
  - `maHoSoNangLuc`: `string`, optional
  - `thuXinViec`: `string`, optional
  - `diemKhopKyNang`: `number`, optional
  - `trangThai`: enum optional
  - `ngayNop`: `date`, optional
- `Response shape`: `{ duLieu: <Application> }`, status `201`
- `Used by frontend`: chưa thấy FE dùng trực tiếp; FE ưu tiên endpoint nghiệp vụ `/ung-tuyen`
- `Postman example`: `POST {{base_url}}/hosoungtuyen`
- `Notes`: với product flow nên dùng endpoint nghiệp vụ thay vì CRUD thô

### `PATCH /hosoungtuyen/:ma`

- `Path`: `/hosoungtuyen/:ma`
- `Method`: `PATCH`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller + guard `kiemTraQuyenCapNhatHoSoUngTuyen` -> `dichVuHoSoUngTuyen.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | nha_tuyen_dung | admin`
- `Purpose`: cập nhật application non-business fields
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: field update generic của application, nhưng:
  - `trangThai`: bị chặn
  - `diemKhopKyNang`: bị chặn
- `Response shape`: `{ duLieu: <Application> }`
- `Used by frontend`: không phải flow chính của FE
- `Postman example`: `PATCH {{base_url}}/hosoungtuyen/:ma`
- `Notes`: nếu muốn đổi trạng thái phải dùng endpoint nghiệp vụ riêng

### `DELETE /hosoungtuyen/:ma`

- `Path`: `/hosoungtuyen/:ma`
- `Method`: `DELETE`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: guard quyền -> `dieuKhienHoSoUngTuyen.xoa`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | nha_tuyen_dung | admin`
- `Purpose`: xóa application
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `DELETE {{base_url}}/hosoungtuyen/:ma`
- `Notes`: quyền phụ thuộc ownership candidate/employer

### `POST /hosoungtuyen/ung-tuyen`

- `Path`: `/hosoungtuyen/ung-tuyen`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.ungTuyen` -> `HoSoUngTuyen`, `LichSuHoSoUngTuyen`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: apply job với CV đã chọn
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maTinTuyenDung`: `string`, bắt buộc
  - `maHoSoNangLuc`: `string`, bắt buộc ở business logic
  - `thuXinViec`: `string`, optional
- `Response shape`: `{ duLieu: <Application> }`, status `201`
- `Used by frontend`: `ChiTietViecLam.tsx`
- `Postman example`: `POST {{base_url}}/hosoungtuyen/ung-tuyen`
- `Notes`: backend tự tạo lịch sử trạng thái và phát thông báo cho employer

### `POST /hosoungtuyen/ung-tuyen-nhanh`

- `Path`: `/hosoungtuyen/ung-tuyen-nhanh`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.ungTuyen`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: apply không chỉ định CV cụ thể trong request
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maTinTuyenDung`: `string`, bắt buộc
  - `thuXinViec`: `string`, optional
- `Response shape`: `{ duLieu: <Application> }`, status `201`
- `Used by frontend`: chưa thấy FE hiện tại gọi trực tiếp
- `Postman example`: `POST {{base_url}}/hosoungtuyen/ung-tuyen-nhanh`
- `Notes`: vẫn đi qua workflow apply

### `POST /hosoungtuyen/:ma/rut`

- `Path`: `/hosoungtuyen/:ma/rut`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.rutHoSo`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: rút application
- `Request params`:
  - `ma`: `string`, id application
- `Query params`: không có
- `Request body`:
  - `ghiChu`: `string`, optional, lý do rút
- `Response shape`: `{ duLieu: <Application> }`
- `Used by frontend`: `UngTuyenPage.tsx`
- `Postman example`: `POST {{base_url}}/hosoungtuyen/:ma/rut`
- `Notes`: nếu có interview chưa kết thúc, backend cũng hủy lịch liên quan

### `POST /hosoungtuyen/:ma/xem`

- `Path`: `/hosoungtuyen/:ma/xem`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.xemHoSo`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung`
- `Purpose`: đánh dấu employer đã xem application
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Application> }`
- `Used by frontend`: `UngVienNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/hosoungtuyen/:ma/xem`
- `Notes`: nếu trạng thái cũ là `da_nop`, backend chuyển sang `da_xem`

### `POST /hosoungtuyen/:ma/danh-gia`

- `Path`: `/hosoungtuyen/:ma/danh-gia`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.danhGiaHoSo`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung`
- `Purpose`: chuyển application sang `dang_xet_duyet` hoặc `tu_choi`
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `trangThai`: `dang_xet_duyet | tu_choi`, bắt buộc
  - `ghiChu`: `string`, optional
  - `giaiDoanTuChoi`: `sang_loc | phong_van`, optional
- `Response shape`: `{ duLieu: <Application> }`
- `Used by frontend`: `UngVienNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/hosoungtuyen/:ma/danh-gia`
- `Notes`: backend phát thông báo khác nhau tùy trạng thái

### `POST /hosoungtuyen/:ma/moi-phong-van`

- `Path`: `/hosoungtuyen/:ma/moi-phong-van`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen` + `workflow`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.moiPhongVan` -> `LichPhongVan`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung`
- `Purpose`: tạo interview từ application và đồng bộ trạng thái
- `Request params`:
  - `ma`: `string`, id application
- `Query params`: không có
- `Request body`:
  - `thoiGianBatDau`: `date|string`, bắt buộc
  - `thoiGianKetThuc`: `date|string`, optional
  - `diaChi`: `string`, optional
  - `hinhThuc`: `online | offline`, optional
  - `linkHop`: `string`, optional
  - `ghiChu`: `string`, optional
- `Response shape`: `{ duLieu: <Interview> }`, status `201`
- `Used by frontend`: `UngVienNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/hosoungtuyen/:ma/moi-phong-van`
- `Notes`: đây là endpoint chuẩn để tạo interview; không nên gọi `POST /lichphongvan`

### `POST /hosoungtuyen/:ma/chuyen-trang-thai`

- `Path`: `/hosoungtuyen/:ma/chuyen-trang-thai`
- `Method`: `POST`
- `Module backend`: `hosoungtuyen`
- `Route file`: `backend/src/modules/hosoungtuyen/hosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: route custom, không gọi service cập nhật thật
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung | admin`
- `Purpose`: endpoint stub để chặn việc đổi trạng thái trực tiếp
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không đáng tin cậy; backend luôn từ chối
- `Response shape`: lỗi `409` với code `BUSINESS_ENDPOINT_REQUIRED`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: không có trong Postman FULL
- `Notes`: backend buộc dùng endpoint nghiệp vụ cụ thể

---

## Application History

### `GET /lichsuhosoungtuyen`

- `Path`: `/lichsuhosoungtuyen`
- `Method`: `GET`
- `Module backend`: `lichsuhosoungtuyen`
- `Route file`: `backend/src/modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichSuHoSoUngTuyen.layDanhSach` -> `LichSuHoSoUngTuyen`
- `Auth / role`: theo route generic hiện tại
- `Purpose`: danh sách lịch sử chuyển trạng thái application
- `Request params`: không có
- `Query params`: Postman `trang`, `soPhanTu`
- `Request body`: không có
- `Response shape`: `{ duLieu: <ApplicationHistory[]> }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/lichsuhosoungtuyen?trang=1&soPhanTu=20`
- `Notes`: workflow apply/interview tự ghi log vào model này

### `GET /lichsuhosoungtuyen/:ma`

- `Path`: `/lichsuhosoungtuyen/:ma`
- `Method`: `GET`
- `Module backend`: `lichsuhosoungtuyen`
- `Route file`: `backend/src/modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichSuHoSoUngTuyen.layTheoMa` -> `LichSuHoSoUngTuyen`
- `Auth / role`: theo route generic hiện tại
- `Purpose`: chi tiết một history record
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/lichsuhosoungtuyen/:ma`
- `Notes`: phù hợp cho audit/debug

### `POST /lichsuhosoungtuyen`

- `Path`: `/lichsuhosoungtuyen`
- `Method`: `POST`
- `Module backend`: `lichsuhosoungtuyen`
- `Route file`: `backend/src/modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichSuHoSoUngTuyen.taoMoi` -> `LichSuHoSoUngTuyen`
- `Auth / role`: theo route generic hiện tại
- `Purpose`: tạo history record thủ công
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maHoSoUngTuyen`: `string`, bắt buộc
  - `trangThaiCu`: enum, optional
  - `trangThaiMoi`: enum, bắt buộc
  - `ghiChu`: `string`, optional
  - `maNguoiDung`: `string`, optional
  - `thoiGian`: `date`, optional
- `Response shape`: `{ duLieu }`, status `201`
- `Used by frontend`: chưa thấy FE dùng
- `Postman example`: `POST {{base_url}}/lichsuhosoungtuyen`
- `Notes`: runtime product flow chủ yếu tạo record này từ service workflow, không cần FE tự gọi

### `PATCH /lichsuhosoungtuyen/:ma`

- `Path`: `/lichsuhosoungtuyen/:ma`
- `Method`: `PATCH`
- `Module backend`: `lichsuhosoungtuyen`
- `Route file`: `backend/src/modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichSuHoSoUngTuyen.capNhat`
- `Auth / role`: theo route generic hiện tại
- `Purpose`: cập nhật history record
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: toàn bộ field của `POST /lichsuhosoungtuyen` đều optional
- `Response shape`: `{ duLieu }`
- `Used by frontend`: chưa thấy FE dùng
- `Postman example`: `PATCH {{base_url}}/lichsuhosoungtuyen/:ma`
- `Notes`: hiếm khi nên dùng trong flow nghiệp vụ chuẩn

### `DELETE /lichsuhosoungtuyen/:ma`

- `Path`: `/lichsuhosoungtuyen/:ma`
- `Method`: `DELETE`
- `Module backend`: `lichsuhosoungtuyen`
- `Route file`: `backend/src/modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichSuHoSoUngTuyen.xoa`
- `Auth / role`: theo route generic hiện tại
- `Purpose`: xóa history record
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: chưa thấy FE dùng
- `Postman example`: `DELETE {{base_url}}/lichsuhosoungtuyen/:ma`
- `Notes`: endpoint admin/debug oriented

---

## Interviews

### `GET /lichphongvan`

- `Path`: `/lichphongvan`
- `Method`: `GET`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichPhongVan.layDanhSach` -> `LichPhongVan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh sách interview
- `Request params`: không có
- `Query params`: Postman `trang`, `soPhanTu`; runtime phụ thuộc service
- `Request body`: không có
- `Response shape`: `{ duLieu: <Interview[]> }`
- `Used by frontend`: `useUngVienData.ts`, `useEmployerData.ts`
- `Postman example`: `GET {{base_url}}/lichphongvan?trang=1&soPhanTu=20`
- `Notes`: candidate và employer đều dùng endpoint này cho list

### `GET /lichphongvan/:ma`

- `Path`: `/lichphongvan/:ma`
- `Method`: `GET`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuLichPhongVan.layTheoMa`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: chi tiết interview
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `GET {{base_url}}/lichphongvan/:ma`
- `Notes`: quyền được kiểm soát bởi service/ownership khi mutation

### `POST /lichphongvan`

- `Path`: `/lichphongvan`
- `Method`: `POST`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom chặn thẳng
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung | admin`
- `Purpose`: endpoint stub, không cho tạo trực tiếp
- `Request params`: không có
- `Query params`: không có
- `Request body`: dù schema generic có hỗ trợ, runtime hiện không cho dùng trực tiếp
- `Response shape`: lỗi `409` với code `BUSINESS_ENDPOINT_REQUIRED`
- `Used by frontend`: không dùng
- `Postman example`: không có yêu cầu body chuẩn runtime
- `Notes`: phải dùng `POST /hosoungtuyen/:ma/moi-phong-van`

### `PATCH /lichphongvan/:ma`

- `Path`: `/lichphongvan/:ma`
- `Method`: `PATCH`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: generic controller + guard `kiemTraQuyenLichPhongVan`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | nha_tuyen_dung | admin`
- `Purpose`: cập nhật non-business fields của interview
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: field generic interview, nhưng `trangThai` và `ketQua` bị chặn khi patch trực tiếp
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: không phải flow chính
- `Postman example`: `PATCH {{base_url}}/lichphongvan/:ma`
- `Notes`: dùng cho cập nhật field cơ bản, không dùng cho state transition

### `DELETE /lichphongvan/:ma`

- `Path`: `/lichphongvan/:ma`
- `Method`: `DELETE`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: guard `kiemTraQuyenLichPhongVan` -> `dieuKhienLichPhongVan.xoa`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung | admin`
- `Purpose`: xóa interview
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: chưa thấy FE dùng
- `Postman example`: `DELETE {{base_url}}/lichphongvan/:ma`
- `Notes`: destructive action

### `POST /lichphongvan/:ma/xac-nhan`

- `Path`: `/lichphongvan/:ma/xac-nhan`
- `Method`: `POST`
- `Module backend`: `lichphongvan` + `workflow`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.xacNhanLichPhongVan`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: candidate xác nhận lịch
- `Request params`:
  - `ma`: `string`, id interview
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: `LichPhongVanPage.tsx`
- `Postman example`: `POST {{base_url}}/lichphongvan/:ma/xac-nhan`
- `Notes`: chỉ hợp lệ khi trạng thái hiện tại là `da_len_lich`

### `POST /lichphongvan/:ma/doi-lich`

- `Path`: `/lichphongvan/:ma/doi-lich`
- `Method`: `POST`
- `Module backend`: `lichphongvan` + `workflow`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.yeuCauDoiLich`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: candidate yêu cầu đổi lịch
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `ghiChu`: `string`, optional, lý do đổi lịch
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: `LichPhongVanPage.tsx`
- `Postman example`: `POST {{base_url}}/lichphongvan/:ma/doi-lich`
- `Notes`: backend còn phát thông báo cho cả employer và admin

### `PATCH /lichphongvan/:ma/cap-nhat`

- `Path`: `/lichphongvan/:ma/cap-nhat`
- `Method`: `PATCH`
- `Module backend`: `lichphongvan` + `workflow`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.capNhatLichPhongVan`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung`
- `Purpose`: employer cập nhật lại lịch
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `thoiGianBatDau`: optional nhưng thực tế nên gửi khi đổi lịch
  - `thoiGianKetThuc`: optional
  - `diaChi`: optional
  - `hinhThuc`: `online | offline`, optional
  - `linkHop`: optional
  - `ghiChu`: optional
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: `LichPhongVanNhaTuyenDungPage.tsx`
- `Postman example`: `PATCH {{base_url}}/lichphongvan/:ma/cap-nhat`
- `Notes`: nếu lịch đang `doi_lich`, backend đổi lại trạng thái về `da_len_lich`

### `POST /lichphongvan/:ma/hoan-thanh`

- `Path`: `/lichphongvan/:ma/hoan-thanh`
- `Method`: `POST`
- `Module backend`: `lichphongvan` + `workflow`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuWorkflowUngTuyen.capNhatKetQuaPhongVan`
- `Auth / role`: bắt buộc đăng nhập, `nha_tuyen_dung`
- `Purpose`: chốt kết quả interview
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `ketQua`: `dat | khong_dat`, bắt buộc
  - `ghiChu`: `string`, optional
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: `UngVienNhaTuyenDungPage.tsx`, `LichPhongVanNhaTuyenDungPage.tsx`
- `Postman example`: `POST {{base_url}}/lichphongvan/:ma/hoan-thanh`
- `Notes`: backend đồng bộ cả trạng thái application sau khi chốt kết quả

### `POST /lichphongvan/:ma/huy`

- `Path`: `/lichphongvan/:ma/huy`
- `Method`: `POST`
- `Module backend`: `lichphongvan`
- `Route file`: `backend/src/modules/lichphongvan/lichphongvan.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `thucThiHanhDongLichPhongVan` -> `dichVuLichPhongVan.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien | nha_tuyen_dung | admin`
- `Purpose`: hủy interview
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`:
  - `ghiChu`: `string`, optional
- `Response shape`: `{ duLieu: <Interview> }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `POST {{base_url}}/lichphongvan/:ma/huy`
- `Notes`: backend ép `trangThai = 'da_huy'`

---

## Notifications

### `GET /thongbao`

- `Path`: `/thongbao`
- `Method`: `GET`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.layDanhSach` -> `dichVuThongBao.layDanhSach` -> `ThongBao`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh sách notification của user hiện tại
- `Request params`: không có
- `Query params`:
  - FE đang dùng: `limit=30&sort=-ngayTao`, đôi khi `limit=200`
  - Postman: `trang`, `soPhanTu`
- `Request body`: không có
- `Response shape`: `{ duLieu: <Notification[]> }`
- `Used by frontend`: `ThongBaoContext.tsx`, `useUngVienData.ts`, `useEmployerData.ts`
- `Postman example`: `GET {{base_url}}/thongbao?trang=1&soPhanTu=20`
- `Notes`: context notification dùng endpoint này làm source chính

### `GET /thongbao/dem-chua-doc`

- `Path`: `/thongbao/dem-chua-doc`
- `Method`: `GET`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.demChuaDoc` -> `dichVuThongBao`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: đếm notification chưa đọc
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: { soLuong } }`
- `Used by frontend`: `ThongBaoContext.tsx`, `DashboardShell.tsx`
- `Postman example`: `GET {{base_url}}/thongbao/dem-chua-doc`
- `Notes`: header/bell badge phụ thuộc endpoint này

### `GET /thongbao/:ma`

- `Path`: `/thongbao/:ma`
- `Method`: `GET`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.layChiTiet`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: chi tiết một notification
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Notification> }`
- `Used by frontend`: chưa thấy FE gọi riêng; UI hiện đọc trực tiếp từ list
- `Postman example`: `GET {{base_url}}/thongbao/:ma`
- `Notes`: thích hợp cho deep-link hoặc debug

### `POST /thongbao`

- `Path`: `/thongbao`
- `Method`: `POST`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.taoMoi` -> `dichVuThongBao.taoMoi`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: tạo notification thủ công
- `Request params`: không có
- `Query params`: không có
- `Request body`: phụ thuộc schema/model notification hiện hành
- `Response shape`: `{ duLieu: <Notification> }`, status `201`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: `POST {{base_url}}/thongbao`
- `Notes`: hệ thống thực tế thường tạo notification từ helper/service nội bộ hơn là FE trực tiếp

### `PATCH /thongbao/:ma`

- `Path`: `/thongbao/:ma`
- `Method`: `PATCH`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.capNhat`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: cập nhật notification
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: payload update notification, ví dụ `daDoc`
- `Response shape`: `{ duLieu: <Notification> }`
- `Used by frontend`: chưa thấy FE ưu tiên; FE dùng action chuyên biệt mark-read
- `Postman example`: `PATCH {{base_url}}/thongbao/:ma`
- `Notes`: product flow nên dùng endpoint mark-read thay vì patch tùy ý

### `PATCH /thongbao/:id/danh-dau-da-doc`

- `Path`: `/thongbao/:id/danh-dau-da-doc`
- `Method`: `PATCH`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.danhDauDaDoc`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: mark một notification là đã đọc
- `Request params`:
  - `id`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: thường `{ duLieu }` theo controller/service
- `Used by frontend`: `ThongBaoContext.tsx`, `NotificationInbox.tsx`
- `Postman example`: `PATCH {{base_url}}/thongbao/:id/danh-dau-da-doc`
- `Notes`: FE state local cũng tự cập nhật optimistically

### `POST /thongbao/danh-dau-tat-ca-da-doc`

- `Path`: `/thongbao/danh-dau-tat-ca-da-doc`
- `Method`: `POST`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.danhDauTatCaDaDoc`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: mark all notifications as read
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: thường `{ duLieu }` hoặc success contract theo controller
- `Used by frontend`: `ThongBaoContext.tsx`, `NotificationInbox.tsx`
- `Postman example`: `POST {{base_url}}/thongbao/danh-dau-tat-ca-da-doc`
- `Notes`: endpoint bulk action

### `DELETE /thongbao/:ma`

- `Path`: `/thongbao/:ma`
- `Method`: `DELETE`
- `Module backend`: `thongbao`
- `Route file`: `backend/src/modules/thongbao/thongbao.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienThongBao.xoa`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: xóa notification
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: chưa thấy UI hiện tại expose delete
- `Postman example`: `DELETE {{base_url}}/thongbao/:ma`
- `Notes`: FE hiện thiên về inbox read-state hơn delete

---

## Messaging

### `GET /tinnhan/admin-support/contacts`

- `Path`: `/tinnhan/admin-support/contacts`
- `Method`: `GET`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layDanhBaHoTroQuanTri` -> `dichVuTinNhan` -> `CuocTroChuyenModel`, `TinNhanModel`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh bạ hỗ trợ admin
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }` hoặc list contact theo controller hiện tại
- `Used by frontend`: chưa thấy FE hiện gọi trực tiếp
- `Postman example`: `GET {{base_url}}/tinnhan/admin-support/contacts`
- `Notes`: hữu ích cho admin support workflow

### `GET /tinnhan/cuoc-tro-chuyen`

- `Path`: `/tinnhan/cuoc-tro-chuyen`
- `Method`: `GET`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layDanhSachCuocTroChuyenModel` -> `dichVuTinNhan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh sách conversation preview
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: list conversation preview, FE đang cast về `CuocTroChuyenPreview[]`
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `GET {{base_url}}/tinnhan/cuoc-tro-chuyen`
- `Notes`: endpoint trọng tâm cho hộp chat của cả 3 role

### `POST /tinnhan/cuoc-tro-chuyen`

- `Path`: `/tinnhan/cuoc-tro-chuyen`
- `Method`: `POST`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layHoacTaoCuocTroChuyenModel` -> `dichVuTinNhan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: lấy hoặc tạo conversation
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `nguoiNhan`: `string`, thường là id user nhận
  - `loai`: optional, context type
  - `maHoSoUngTuyen`: optional
  - `maTinTuyenDung`: optional
- `Response shape`: `<CuocTroChuyenPreview>` hoặc `{ duLieu }` tùy controller
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `POST {{base_url}}/tinnhan/cuoc-tro-chuyen`
- `Notes`: Postman FULL đang ghi `nguoiNhanId`, nhưng FE hiện gửi `nguoiNhan`

### `GET /tinnhan/cuoc-tro-chuyen/:id`

- `Path`: `/tinnhan/cuoc-tro-chuyen/:id`
- `Method`: `GET`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layCuocTroChuyenModel`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: lấy detail conversation
- `Request params`:
  - `id`: `string`, conversation id
- `Query params`: không có
- `Request body`: không có
- `Response shape`: conversation detail
- `Used by frontend`: chưa thấy FE gọi trực tiếp; FE chủ yếu lấy message list
- `Postman example`: `GET {{base_url}}/tinnhan/cuoc-tro-chuyen/:id`
- `Notes`: thuận tiện cho debug/support tool

### `POST /tinnhan/cuoc-tro-chuyen/:id/danh-dau-da-doc`

- `Path`: `/tinnhan/cuoc-tro-chuyen/:id/danh-dau-da-doc`
- `Method`: `POST`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.danhDauDaDoc` -> `dichVuTinNhan.danhDauDaDoc`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: mark conversation đã đọc
- `Request params`:
  - `id`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: conversation hydrated hoặc success payload
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `POST {{base_url}}/tinnhan/cuoc-tro-chuyen/:id/danh-dau-da-doc`
- `Notes`: FE gọi khi mở conversation có unread count

### `GET /tinnhan/nhom-cong-dong`

- `Path`: `/tinnhan/nhom-cong-dong`
- `Method`: `GET`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layNhomCongDong`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: danh sách community group
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: list groups
- `Used by frontend`: chưa thấy FE hiện dùng trực tiếp
- `Postman example`: `GET {{base_url}}/tinnhan/nhom-cong-dong`
- `Notes`: runtime feature có backend nhưng FE hiện chưa nổi bật

### `POST /tinnhan/nhom-cong-dong/tham-gia/:id`

- `Path`: `/tinnhan/nhom-cong-dong/tham-gia/:id`
- `Method`: `POST`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.thamGiaNhomCongDong`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: join community group
- `Request params`:
  - `id`: `string`, group id
- `Query params`: không có
- `Request body`: không có
- `Response shape`: group hydrated
- `Used by frontend`: chưa thấy FE dùng trực tiếp
- `Postman example`: `POST {{base_url}}/tinnhan/nhom-cong-dong/tham-gia/:id`
- `Notes`: backend còn tạo system message “đã tham gia nhóm”

### `GET /tinnhan/cuoc-tro-chuyen/:id/tin-nhan`

- `Path`: `/tinnhan/cuoc-tro-chuyen/:id/tin-nhan`
- `Method`: `GET`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.layDanhSachTinNhan` -> `dichVuTinNhan.layDanhSachTinNhan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: message list trong conversation
- `Request params`:
  - `id`: `string`, conversation id
- `Query params`:
  - FE dùng `limit=50`
  - Postman cũ ghi `trang=1&soPhanTu=50`
- `Request body`: không có
- `Response shape`: `TinNhan[]`
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `GET {{base_url}}/tinnhan/cuoc-tro-chuyen/:id/tin-nhan?trang=1&soPhanTu=50`
- `Notes`: FE hiện không dùng page-based params mà dùng `limit`

### `POST /tinnhan/cuoc-tro-chuyen/:id/tin-nhan`

- `Path`: `/tinnhan/cuoc-tro-chuyen/:id/tin-nhan`
- `Method`: `POST`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.guiTinNhan` -> `dichVuTinNhan.guiTinNhan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: gửi message
- `Request params`:
  - `id`: `string`, conversation id
- `Query params`: không có
- `Request body`:
  - `noiDung`: `string`, bắt buộc
  - `traloiTinNhan`: `string`, optional, reply target
- `Response shape`: `<TinNhan>`
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `POST {{base_url}}/tinnhan/cuoc-tro-chuyen/:id/tin-nhan`
- `Notes`: FE có optimistic message trước khi server confirm

### `DELETE /tinnhan/tin-nhan/:maTinNhan`

- `Path`: `/tinnhan/tin-nhan/:maTinNhan`
- `Method`: `DELETE`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.xoaTinNhan` -> `dichVuTinNhan.xoaTinNhan`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: soft delete message
- `Request params`:
  - `maTinNhan`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: thường là tin nhắn đã cập nhật/xóa mềm
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `DELETE {{base_url}}/tinnhan/tin-nhan/:maTinNhan`
- `Notes`: service đổi nội dung thành “Tin nhắn đã bị xóa”

### `POST /tinnhan/tin-nhan/:maTinNhan/phan-ung`

- `Path`: `/tinnhan/tin-nhan/:maTinNhan/phan-ung`
- `Method`: `POST`
- `Module backend`: `tinnhan`
- `Route file`: `backend/src/modules/tinnhan/tinnhan.dinhtuyen.ts`
- `Controller / service / model`: `dieuKhienTinNhan.themPhanUng` -> `dichVuTinNhan.themPhanUng`
- `Auth / role`: bắt buộc đăng nhập
- `Purpose`: react vào message
- `Request params`:
  - `maTinNhan`: `string`
- `Query params`: không có
- `Request body`:
  - `emoji`: `string`, FE hiện gửi trường này
- `Response shape`: updated message/reaction payload
- `Used by frontend`: `ChatContext.tsx`
- `Postman example`: `POST {{base_url}}/tinnhan/tin-nhan/:maTinNhan/phan-ung`
- `Notes`: Postman FULL đang dùng `loaiPhanUng`, nhưng FE/runtime hiện dùng `emoji`

---

## Company Reviews

### `GET /danhgiacongty`

- `Path`: `/danhgiacongty`
- `Method`: `GET`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhGiaCongTy.layDanhSach` -> `DanhGiaCongTy`
- `Auth / role`: public
- `Purpose`: danh sách review công ty
- `Request params`: không có
- `Query params`: Postman `trang`, `soPhanTu`
- `Request body`: không có
- `Response shape`: `{ duLieu: <Review[]> }`
- `Used by frontend`: `DanhSachCongTy.tsx`, `HoSoCongTy.tsx`, `QuanLyReviewCongTyAdmin.tsx`
- `Postman example`: `GET {{base_url}}/danhgiacongty?trang=1&soPhanTu=20`
- `Notes`: admin page cũng dùng endpoint list này rồi lọc/moderate

### `GET /danhgiacongty/toi`

- `Path`: `/danhgiacongty/toi`
- `Method`: `GET`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuDanhGiaCongTy.layCuaUngVien`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: review của ứng viên hiện tại
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Review[]> }`
- `Used by frontend`: `useUngVienData.ts`
- `Postman example`: không có trong Postman FULL
- `Notes`: endpoint runtime có thật nhưng collection FULL chưa cover

### `POST /danhgiacongty/tu-ho-so/:maHoSoUngTuyen`

- `Path`: `/danhgiacongty/tu-ho-so/:maHoSoUngTuyen`
- `Method`: `POST`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: route custom -> `dichVuDanhGiaCongTy.taoTuHoSo`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: tạo review từ application sau phỏng vấn hoàn tất
- `Request params`:
  - `maHoSoUngTuyen`: `string`
- `Query params`: không có
- `Request body`:
  - `diem`: `number`, bắt buộc, 1..5
  - `noiDung`: `string`, bắt buộc, min 10
  - `anDanh`: `boolean`, optional
- `Response shape`: `{ duLieu: <Review> }`, status `201`
- `Used by frontend`: `frontend/src/pages/ungvien/ungtuyen/AppDrawer.tsx`
- `Postman example`: không có trong Postman FULL
- `Notes`: backend yêu cầu interview đã `hoan_thanh` và có `ketQua`

### `GET /danhgiacongty/:ma`

- `Path`: `/danhgiacongty/:ma`
- `Method`: `GET`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhGiaCongTy.layTheoMa`
- `Auth / role`: public
- `Purpose`: chi tiết review
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: <Review> }`
- `Used by frontend`: chưa thấy FE gọi riêng
- `Postman example`: `GET {{base_url}}/danhgiacongty/:ma`
- `Notes`: chủ yếu cho debug/admin

### `POST /danhgiacongty`

- `Path`: `/danhgiacongty`
- `Method`: `POST`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhGiaCongTy.taoMoi`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: tạo review thủ công
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `maUngVien`: `string`, bắt buộc
  - `maNhaTuyenDung`: `string`, bắt buộc
  - `maHoSoUngTuyen`: `string`, optional
  - `diem`: `number`, bắt buộc
  - `noiDung`: `string`, bắt buộc
  - `anDanh`: `boolean`, optional
  - `daDuyet`: `boolean`, optional
- `Response shape`: `{ duLieu: <Review> }`, status `201`
- `Used by frontend`: chưa thấy FE dùng trực tiếp
- `Postman example`: `POST {{base_url}}/danhgiacongty`
- `Notes`: admin page hiện không tạo mới từ UI

### `PATCH /danhgiacongty/:ma`

- `Path`: `/danhgiacongty/:ma`
- `Method`: `PATCH`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhGiaCongTy.capNhat`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: moderate/cập nhật review
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: toàn bộ field create review đều optional; admin page hiện chủ yếu gửi `daDuyet: true`
- `Response shape`: `{ duLieu: <Review> }`
- `Used by frontend`: `QuanLyReviewCongTyAdmin.tsx`
- `Postman example`: `PATCH {{base_url}}/danhgiacongty/:ma`
- `Notes`: dùng cho approval moderation

### `DELETE /danhgiacongty/:ma`

- `Path`: `/danhgiacongty/:ma`
- `Method`: `DELETE`
- `Module backend`: `danhgiacongty`
- `Route file`: `backend/src/modules/danhgiacongty/danhgiacongty.dinhtuyen.ts`
- `Controller / service / model`: generic controller -> `dichVuDanhGiaCongTy.xoa`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: xóa review
- `Request params`:
  - `ma`: `string`
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `204 No Content`
- `Used by frontend`: `QuanLyReviewCongTyAdmin.tsx`
- `Postman example`: `DELETE {{base_url}}/danhgiacongty/:ma`
- `Notes`: destructive moderation action

---

## AI

### `POST /ai/chatbot`

- `Path`: `/ai/chatbot`
- `Method`: `POST`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.chatbot` -> hỗ trợ `GoiYViecLam` ở phần suggestion
- `Auth / role`: public
- `Purpose`: chat AI công khai
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `cauHoi` hoặc `message`: `string`, bắt buộc theo thực tế route
  - `lichSu`: optional
  - `boLoc`: optional
- `Response shape`: `{ duLieu }`
- `Used by frontend`: `TimKiemViecLam.tsx`, `HomeAiMascotChat.tsx`
- `Postman example`: `POST {{base_url}}/ai/chatbot`
- `Notes`: backend đọc cả `cauHoi` lẫn `message`

### `GET /ai/goi-y-viec-lam`

- `Path`: `/ai/goi-y-viec-lam`
- `Method`: `GET`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.layGoiY` -> `GoiYViecLam`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: lấy gợi ý job hiện có của ứng viên
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: `DashboardUngVienPage.tsx`
- `Postman example`: Postman FULL đang lệch, ghi `POST /ai/goi-y-viec-lam`
- `Notes`: runtime chuẩn là `GET`, không phải `POST`

### `POST /ai/goi-y-viec-lam/chay-ngay`

- `Path`: `/ai/goi-y-viec-lam/chay-ngay`
- `Method`: `POST`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.chayGoiY`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: chạy lại engine gợi ý ngay lập tức
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`, status `201`
- `Used by frontend`: `DashboardUngVienPage.tsx`
- `Postman example`: không có trong Postman FULL
- `Notes`: runtime đã tách rõ hành vi “read cached suggestions” và “recompute now”

### `POST /ai/goi-y-viec-lam/gui-email`

- `Path`: `/ai/goi-y-viec-lam/gui-email`
- `Method`: `POST`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.guiEmailGoiY`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: gửi email gợi ý việc làm cho ứng viên hiện tại
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: `DashboardUngVienPage.tsx`
- `Postman example`: không có trong Postman FULL
- `Notes`: endpoint side-effectful

### `POST /ai/goi-y-cv`

- `Path`: `/ai/goi-y-cv`
- `Method`: `POST`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.goiYDienCv`
- `Auth / role`: bắt buộc đăng nhập, `ung_vien`
- `Purpose`: AI hỗ trợ điền/gợi ý CV
- `Request params`: không có
- `Query params`: không có
- `Request body`: payload CV source/input, pass-through từ FE
- `Response shape`: `{ duLieu }`
- `Used by frontend`: chưa thấy FE hiện tại gọi trực tiếp
- `Postman example`: không có trong Postman FULL dưới tên này
- `Notes`: Postman FULL có `AI phân tích CV` và `AI khớp kỹ năng`, nhưng runtime hiện expose `goi-y-cv`

### `GET /ai/goi-y-viec-lam/admin/preview`

- `Path`: `/ai/goi-y-viec-lam/admin/preview`
- `Method`: `GET`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.previewGuiEmailHangLoat`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: preview chiến dịch email gợi ý hàng loạt
- `Request params`: không có
- `Query params`:
  - `diemToiThieu`: `number`, optional
  - `soJobMoiEmail`: `number`, optional
- `Request body`: không có
- `Response shape`: `{ duLieu }`
- `Used by frontend`: `DuyetTinTuyenDungAdmin.tsx`
- `Postman example`: không có trong Postman FULL
- `Notes`: admin tools dùng endpoint này trước khi gửi email hàng loạt

### `POST /ai/goi-y-viec-lam/admin/gui-email-hang-loat`

- `Path`: `/ai/goi-y-viec-lam/admin/gui-email-hang-loat`
- `Method`: `POST`
- `Module backend`: `ai`
- `Route file`: `backend/src/modules/ai/ai.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `dichVuAi.guiEmailHangLoat`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: trigger gửi email AI recommendation hàng loạt
- `Request params`: không có
- `Query params`: không có
- `Request body`:
  - `diemToiThieu`: `number`, optional
  - `soJobMoiEmail`: `number`, optional
- `Response shape`: `{ duLieu }`, status `202`
- `Used by frontend`: `DuyetTinTuyenDungAdmin.tsx`
- `Postman example`: không có trong Postman FULL
- `Notes`: side-effectful batch action

---

## Admin Alerts

### `GET /canhbaoquantri`

- `Path`: `/canhbaoquantri`
- `Method`: `GET`
- `Module backend`: `canhbaoquantri`
- `Route file`: `backend/src/modules/canhbaoquantri/canhbaoquantri.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `laySnapshotCanhBaoQuanTri` -> aggregate từ `TinTuyenDung`, `NhaTuyenDung`, `HoSoUngTuyen`, `NguoiDung`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: lấy snapshot cảnh báo vận hành
- `Request params`: không có
- `Query params`: Postman FULL ghi paging nhưng runtime không dùng
- `Request body`: không có
- `Response shape`: `{ duLieu: { canhBao, thongKe, capNhatLuc } }`
- `Used by frontend`: `DashboardQuanTriVien.tsx`
- `Postman example`: `GET {{base_url}}/canhbaoquantri`
- `Notes`: dữ liệu là snapshot in-memory do cron/service cập nhật, không phải CRUD record

### `POST /canhbaoquantri/tinh-lai`

- `Path`: `/canhbaoquantri/tinh-lai`
- `Method`: `POST`
- `Module backend`: `canhbaoquantri`
- `Route file`: `backend/src/modules/canhbaoquantri/canhbaoquantri.dinhtuyen.ts`
- `Controller / service / model`: inline handler -> `tinhCanhBaoQuanTri`
- `Auth / role`: bắt buộc đăng nhập, `admin`
- `Purpose`: ép hệ thống tính lại cảnh báo ngay
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: `{ duLieu: { canhBao, thongKe, capNhatLuc } }`
- `Used by frontend`: chưa thấy FE gọi trực tiếp
- `Postman example`: không có trong Postman FULL
- `Notes`: endpoint runtime có thật nhưng collection FULL đang mô tả sai cả module như một CRUD resource

---

## Deploy

### `GET /deploy/sitemap.xml`

- `Path`: `/deploy/sitemap.xml`
- `Method`: `GET`
- `Module backend`: `deploy`
- `Route file`: `backend/src/modules/deploy/deploy.dinhtuyen.ts`
- `Controller / service / model`: inline handler; query trực tiếp `prisma.tinTuyenDung` và `prisma.nhaTuyenDung`
- `Auth / role`: public
- `Purpose`: sinh sitemap XML cho Google/search engine
- `Request params`: không có
- `Query params`: không có
- `Request body`: không có
- `Response shape`: XML, `Content-Type: application/xml; charset=utf-8`
- `Used by frontend`: không dùng trực tiếp; dành cho crawler/SEO
- `Postman example`: `GET {{base_url}}/deploy/sitemap.xml`
- `Notes`: cache header `max-age=3600`

---

## Sai Lệch Postman So Với Backend Hiện Tại

| Loại lệch | Postman FULL | Backend runtime hiện tại | Ghi chú |
| --- | --- | --- | --- |
| Sai method | `POST /ai/goi-y-viec-lam` | `GET /ai/goi-y-viec-lam` | FE candidate dashboard đang dùng `GET` |
| Thiếu endpoint runtime | Không có `POST /ai/goi-y-viec-lam/chay-ngay` | Có thật | FE candidate dashboard dùng |
| Thiếu endpoint runtime | Không có `POST /ai/goi-y-viec-lam/gui-email` | Có thật | FE candidate dashboard dùng |
| Thiếu endpoint runtime | Không có `POST /ai/goi-y-cv` | Có thật | Runtime đổi tên capability so với collection |
| Sai endpoint AI | `POST /ai/phan-tich-cv` | Không thấy mount | Chỉ còn `POST /ai/goi-y-cv` |
| Sai endpoint AI | `POST /ai/khop-ky-nang` | Không thấy mount | Collection cũ hơn runtime |
| Sai mô hình module | CRUD `GET/POST/PATCH/DELETE /canhbaoquantri/:ma` | Chỉ có `GET /canhbaoquantri` và `POST /canhbaoquantri/tinh-lai` | `canhbaoquantri` là snapshot aggregate, không phải CRUD entity |
| Thiếu endpoint runtime | Không có `GET /danhgiacongty/toi` | Có thật | FE candidate data hook dùng |
| Thiếu endpoint runtime | Không có `POST /danhgiacongty/tu-ho-so/:maHoSoUngTuyen` | Có thật | FE review-from-application dùng |
| Thiếu endpoint runtime | Không có `POST /hosoungtuyen/:ma/chuyen-trang-thai` | Có thật nhưng luôn trả `409` | Stub chặn chuyển trạng thái trực tiếp |
| Sai ý nghĩa endpoint | `POST /lichphongvan` trông như create trực tiếp | Runtime trả `409` | Phải dùng `POST /hosoungtuyen/:ma/moi-phong-van` |
| Sai field body | `POST /tinnhan/cuoc-tro-chuyen` dùng `nguoiNhanId` | FE/runtime hiện dùng `nguoiNhan` | Cần đồng bộ collection |
| Sai field body | `POST /tinnhan/tin-nhan/:maTinNhan/phan-ung` dùng `loaiPhanUng` | FE/runtime hiện dùng `emoji` | Cần đồng bộ collection |
| FE gọi route không mount | FE dùng `/thongbao/push-subscription` | Không thấy route trong `thongbao.dinhtuyen.ts` | Cần kiểm tra feature push subscription đang thiếu backend hay chưa merge |

## Ghi Chú Tổng Hợp

- Nguồn chuẩn của tài liệu này là runtime backend hiện tại, không phải collection Postman.
- Nhiều module CRUD đang dùng `taoDinhTuyenCoBan` hoặc `taoDieuKhienCoBan`; vì vậy cần phân biệt:
  - endpoint CRUD thuần
  - endpoint nghiệp vụ custom ở file route
- Các flow quan trọng không nên dùng CRUD thuần:
  - Apply job: dùng `/hosoungtuyen/ung-tuyen`
  - Mời phỏng vấn: dùng `/hosoungtuyen/:ma/moi-phong-van`
  - Chốt kết quả interview: dùng `/lichphongvan/:ma/hoan-thanh`
  - Duyệt/từ chối job: dùng `/tintuyendung/:ma/duyet`, `/tintuyendung/:ma/tu-choi`
- Nếu cập nhật Postman sau tài liệu này, nên ưu tiên đồng bộ theo `backend/src/modules/*/*.dinhtuyen.ts` trước, rồi mới sửa example body/query cho đẹp.

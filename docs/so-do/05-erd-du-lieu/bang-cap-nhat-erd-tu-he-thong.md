# Bang cap nhat ERD theo logic he thong hien tai

Tai lieu nay dung de cap nhat ERD cu sang schema dang co trong `backend/src/modules/*/*.mohinh.ts`.

## 1. Bang cu can bo sung hoac sua

| Bang trong ERD cu | Viec can lam | Truong/quan he can them hoac sua | Ghi chu logic he thong |
|---|---|---|---|
| `NGUOIDUNG` | Them truong reset mat khau | `maDatLaiMatKhauHash`, `maDatLaiMatKhauHetHan` | Chuc nang quen mat khau luu hash token va thoi han vao nguoi dung, khong can bang rieng `EmailDatLaiMatKhau`. |
| `NGUOIDUNG` | Chuan hoa enum | `vaiTro`: `ung_vien`, `nha_tuyen_dung`, `admin`; `trangThai`: `hoat_dong`, `tam_khoa`, `bi_khoa` | Dung dung gia tri backend dang validate. |
| `UNGVIEN` | Them truong profile | `anhDaiDien` | Trang ung vien/CV co anh dai dien. |
| `UNGVIEN` | Them du lieu portfolio | Nen them bang con `UNGVIEN_PORTFOLIO`: `id`, `maUngVien`, `tenDuAn`, `lienKet`, `moTa`, `congNghe` | Trong Mongo la mang embedded `portfolio`; neu ve ERD quan he thi tach bang con. |
| `UNGVIEN_KYNANG` | Giu va chuan hoa | `maUngVien`, `maKyNang`, `mucDo` | Trong code la embedded `UngVien.kyNang`, nhung ERD quan he tach bang nay la hop ly. |
| `NHATUYENDUNG` | Them truong thue | `maSoThue` | Form dang ky/cap nhat cong ty co ma so thue. |
| `NHATUYENDUNG` | Them timestamp neu ERD cu thieu | `ngayTao`, `ngayCapNhat` | Schema co timestamps. |
| `NHATUYENDUNG` | Chuan hoa enum duyet | `trangThaiDuyet`: `cho_duyet`, `da_duyet`, `tu_choi`, `bi_khoa` | Dung cho admin duyet cong ty. |
| `TINTUYENDUNG` | Them noi dung tin | `tieuDe`, `moTa`, `yeuCau`, `quyenLoi` | Day la cac truong bat buoc/chinh trong form dang tin. |
| `TINTUYENDUNG` | Them hien thi va so luong | `anhDaiDien`, `soLuong` | Trang chi tiet va form dang tin co anh/so luong. |
| `TINTUYENDUNG` | Them timestamp neu thieu | `ngayTao`, `ngayCapNhat` | Schema co timestamps; `ngayDang` chi co khi tin duoc mo/duyet. |
| `TINTUYENDUNG` | Chuan hoa enum | `loaiHinh`: `toan_thoi_gian`, `ban_thoi_gian`, `thuc_tap`, `tu_xa`, `hybrid`; `capBac`: `intern`, `fresher`, `junior`, `middle`, `senior`, `lead`; `trangThai`: `nhap`, `cho_duyet`, `dang_mo`, `tam_dong`, `het_han`, `tu_choi` | Dung cho tim kiem, quan ly tin, duyet tin. |
| `TINTUYENDUNG_KYNANG` | Giu va chuan hoa | `maTinTuyenDung`, `maKyNang`, `batBuoc` | Trong code la embedded `TinTuyenDung.kyNang`; ERD quan he tach bang nay la hop ly. |
| `DANHMUC_KYNANG` | Them timestamp | `ngayTao`, `ngayCapNhat` | Schema co timestamps. |
| `HOSONANGLUC` | Bo sung thong tin CV hien thi | `hoTenHienThi`, `chucDanh`, `soDienThoai`, `emailLienHe`, `facebook`, `github`, `portfolioUrl`, `diaDiem`, `anhDaiDien` | CV studio luu thong tin hien thi rieng, khong chi lay tu `UNGVIEN`. |
| `HOSONANGLUC` | Bo sung file CV/upload | `fileCvTen`, `fileCvLoai`, `fileCvData`, `fileCvText`, `fileCvPath`, `fileCvTextStatus`, `fileCvTextError`, `loaiHoSo` | Ho tro CV builder va file upload. `fileCvTextStatus`: `ok`, `empty`, `gemini_pdf`, `failed`; `loaiHoSo`: `builder`, `file_upload`. |
| `HOSONANGLUC` | Bo sung tuy bien template | `templateCv`, `mauChinh`, `mauPhu`, `font`, `markdownGoc`, `ghiChuAi` | CV studio co template, mau, font va ghi chu AI. |
| `HOSONANGLUC` | Chuyen cac truong mang thanh bang con neu ve ERD quan he | `hocVan`, `kinhNghiemLam`, `chungChi`, `duAn`, `tomTatKinhNghiem`, `kyNangMem`, `kyNangLapTrinh`, `baiVietKyThuat`, `duAnChiTiet` | Trong Mongo la embedded arrays; ERD quan he nen tach bang con o muc 2. |
| `HOSOUNGTUYEN` | Them timestamp neu thieu | `ngayTao`, `ngayCapNhat` | `ngayNop` la ngay nop nghiep vu; timestamps la ngay tao/cap nhat ban ghi. |
| `HOSOUNGTUYEN` | Chuan hoa enum trang thai | `da_nop`, `da_xem`, `dang_xet_duyet`, `moi_phong_van`, `dat`, `tu_choi`, `da_rut` | Dung cho pipeline ung vien, lich phong van va thong bao. |
| `LICHPHONGVAN` | Them link hop | `linkHop` | Phong van online can link hop. |
| `LICHPHONGVAN` | Them timestamp neu thieu | `ngayCapNhat` | Schema co timestamps. |
| `LICHPHONGVAN` | Chuan hoa enum | `hinhThuc`: `online`, `offline`; `trangThai`: `da_len_lich`, `da_xac_nhan`, `doi_lich`, `hoan_thanh`, `da_huy`; `ketQua`: `cho_ket_qua`, `dat`, `khong_dat` | Dung cho ung vien phan hoi lich va nha tuyen dung cap nhat ket qua. |
| `DANHGIA_CONGTY` | Sua FK nghiep vu | Bo/khong uu tien `maLichPV`; them `maHoSoUngTuyen` | Code hien tai lien ket danh gia voi `HoSoUngTuyen`, khong lien ket truc tiep voi `LichPhongVan`. Dieu kien duoc danh gia duoc kiem tra qua ho so/lich su/lich phong van. |
| `DANHGIA_CONGTY` | Them truong kiem duyet | `anDanh`, `daDuyet`, `ngayCapNhat` | Ung vien co the danh gia an danh; admin duyet danh gia truoc khi hien thi. |
| `DANHGIA_CONGTY` | Them rang buoc | `UNIQUE(maHoSoUngTuyen)` co dieu kien nullable/sparse | Moi ho so ung tuyen chi duoc tao mot danh gia cong ty. |
| `LICHSU_HOSOUNGTUYEN` | Them timestamp neu thieu | `ngayTao`, `ngayCapNhat` | Schema co timestamps ngoai truong nghiep vu `thoiGian`. |
| `THONGBAO` | Them tham chieu tin tuyen dung | `maTinTuyenDung` | Thong bao duyet tin, tin moi, lien quan tin tuyen dung. |
| `THONGBAO` | Them trang thai gui/doc | `daGui`, giu `daDoc` | Ho tro notification center/push/email. |
| `THONGBAO` | Them uu tien va hanh dong | `mucDoUuTien`, `hanhDong`, `icon`, `mauSac`, `hetHan`, `ngayCapNhat` | `hanhDong` la mang nut thao tac: `nhan`, `url`, `loai`; `mucDoUuTien`: `thap`, `trung_binh`, `cao`, `khan_cap`. |
| `THONGBAO` | Chuan hoa enum loai | `he_thong`, `ho_so_ung_tuyen`, `lich_phong_van`, `tin_tuyen_dung`, `cong_ty`, `tin_nhan`, `ket_qua_phong_van` | Bao phu toan bo flow he thong. |

## 2. Bang moi nen them vao ERD

| Bang moi | Truong chinh | Khoa/quan he | Muc dich |
|---|---|---|---|
| `VIEC_LAM_DA_LUU` | `maViecLamDaLuu`, `maNguoiDung`, `maTinTuyenDung`, `ngayLuu`, `ngayTao`, `ngayCapNhat` | FK `maNguoiDung` -> `NGUOIDUNG`; FK `maTinTuyenDung` -> `TINTUYENDUNG`; UNIQUE(`maNguoiDung`, `maTinTuyenDung`) | Ung vien luu/bo luu viec lam. |
| `CUOC_TRO_CHUYEN` | `maCuocTroChuyen`, `loai`, `tenNhom`, `moTaNhom`, `anhNhom`, `maHoSoUngTuyen`, `maTinTuyenDung`, `maHoSoUngTuyenGanNhat`, `maTinTuyenDungGanNhat`, `contextSummary`, `tinNhanCuoiCung`, `soChuaDoc`, `daLuuTru`, `thoiGianLuuTru`, `ngayTao`, `ngayCapNhat` | FK den `HOSOUNGTUYEN`, `TINTUYENDUNG`; quan he N-N voi `NGUOIDUNG` qua bang tham gia | Phong chat ung vien - nha tuyen dung, admin support, nhom cong dong. |
| `CUOCTROCHUYEN_NGUOITHAMGIA` | `id`, `maCuocTroChuyen`, `maNguoiDung` | FK `maCuocTroChuyen` -> `CUOC_TRO_CHUYEN`; FK `maNguoiDung` -> `NGUOIDUNG` | Tach mang `nguoiThamGia` trong Mongo sang ERD quan he. |
| `CUOCTROCHUYEN_QUANTRINHOM` | `id`, `maCuocTroChuyen`, `maNguoiDung` | FK den `CUOC_TRO_CHUYEN`, `NGUOIDUNG` | Quan tri vien cua nhom chat cong dong. |
| `TIN_NHAN` | `maTinNhan`, `maCuocTroChuyenId`, `nguoiGui`, `loai`, `noiDung`, `traloiTinNhan`, `daXoa`, `daChinhSua`, `thoiGianChinhSua`, `ngayTao`, `ngayCapNhat` | FK `maCuocTroChuyenId` -> `CUOC_TRO_CHUYEN`; FK `nguoiGui` -> `NGUOIDUNG`; self-FK `traloiTinNhan` -> `TIN_NHAN` | Luu tin nhan text/file/image/system. |
| `TINNHAN_TEPDINHKEM` | `id`, `maTinNhan`, `tenFile`, `duongDan`, `kichThuoc`, `loaiFile` | FK `maTinNhan` -> `TIN_NHAN` | Tach mang file dinh kem. |
| `TINNHAN_DADOCBOI` | `id`, `maTinNhan`, `maNguoiDung`, `thoiGian` | FK den `TIN_NHAN`, `NGUOIDUNG` | Read receipt cua tung nguoi dung. |
| `TINNHAN_PHANUNG` | `id`, `maTinNhan`, `maNguoiDung`, `emoji` | FK den `TIN_NHAN`, `NGUOIDUNG` | Reaction emoji tren tin nhan. |
| `GOI_Y_VIEC_LAM` | `maGoiYViecLam`, `maUngVien`, `maHoSoNangLuc`, `trangThai`, `loi`, `nguon`, `lanQuet`, `ngayTao`, `ngayCapNhat` | FK `maUngVien` -> `UNGVIEN`; FK `maHoSoNangLuc` -> `HOSONANGLUC` | Luu ket qua goi y viec lam AI cho ung vien. |
| `GOIYVIECLAM_KETQUA` | `id`, `maGoiYViecLam`, `maTinTuyenDung`, `diem`, `lyDo`, `kyNangKhop`, `kyNangThieu` | FK `maGoiYViecLam` -> `GOI_Y_VIEC_LAM`; FK `maTinTuyenDung` -> `TINTUYENDUNG` | Moi lan quet AI co nhieu tin duoc cham diem. Co the de `kyNangKhop`, `kyNangThieu` dang JSON/TEXT hoac tach tiep neu can. |
| `UNGVIEN_PORTFOLIO` | `id`, `maUngVien`, `tenDuAn`, `lienKet`, `moTa`, `congNghe` | FK `maUngVien` -> `UNGVIEN` | Portfolio ung vien. |
| `HOSONANGLUC_MUCTHONGTIN` | `id`, `maHoSoNangLuc`, `loaiMuc`, `tieuDe`, `donVi`, `thoiGian`, `moTa` | FK `maHoSoNangLuc` -> `HOSONANGLUC`; `loaiMuc`: `hoc_van`, `kinh_nghiem_lam`, `chung_chi`, `du_an` | Gom 4 mang co cung cau truc trong CV. |
| `HOSONANGLUC_KYNANGLAPTRINH` | `id`, `maHoSoNangLuc`, `nhom`, `muc` | FK `maHoSoNangLuc` -> `HOSONANGLUC` | Nhom ky nang lap trinh trong CV; `muc` co the luu JSON/TEXT hoac tach bang con neu can. |
| `HOSONANGLUC_LIENKET` | `id`, `maHoSoNangLuc`, `loai`, `nhan`, `url` | FK `maHoSoNangLuc` -> `HOSONANGLUC`; `loai`: `bai_viet_ky_thuat`, `du_an_chi_tiet` | Luu cac lien ket trong CV. |
| `HOSONANGLUC_DUANCHITIET` | `id`, `maHoSoNangLuc`, `tenDuAn`, `thoiGian`, `viTri`, `moTa`, `trachNhiem`, `heDieuHanh`, `ngonNgu`, `framework`, `kyThuat`, `diaDiem` | FK `maHoSoNangLuc` -> `HOSONANGLUC` | Du an chi tiet trong CV studio. |

## 3. Quan he can them/sua tren ERD

| Quan he | Kieu | Ghi chu |
|---|---|---|
| `NGUOIDUNG` -> `VIEC_LAM_DA_LUU` | 1-N | Mot nguoi dung co nhieu viec da luu. |
| `TINTUYENDUNG` -> `VIEC_LAM_DA_LUU` | 1-N | Mot tin co the duoc nhieu nguoi luu. |
| `HOSOUNGTUYEN` -> `CUOC_TRO_CHUYEN` | 1-N, optional | Chat co the gan ngu canh ho so ung tuyen. |
| `TINTUYENDUNG` -> `CUOC_TRO_CHUYEN` | 1-N, optional | Chat co the gan ngu canh tin tuyen dung. |
| `NGUOIDUNG` <-> `CUOC_TRO_CHUYEN` | N-N | Qua `CUOCTROCHUYEN_NGUOITHAMGIA`. |
| `CUOC_TRO_CHUYEN` -> `TIN_NHAN` | 1-N | Mot cuoc tro chuyen co nhieu tin nhan. |
| `NGUOIDUNG` -> `TIN_NHAN` | 1-N | Mot nguoi dung gui nhieu tin nhan. |
| `TIN_NHAN` -> `TIN_NHAN` | self optional | Tin nhan co the tra loi mot tin nhan khac. |
| `UNGVIEN` -> `GOI_Y_VIEC_LAM` | 1-N | Moi ung vien co nhieu lan quet goi y. |
| `HOSONANGLUC` -> `GOI_Y_VIEC_LAM` | 1-N, optional | Goi y co the dua tren mot CV. |
| `GOI_Y_VIEC_LAM` -> `GOIYVIECLAM_KETQUA` | 1-N | Mot lan quet co nhieu ket qua tin. |
| `TINTUYENDUNG` -> `GOIYVIECLAM_KETQUA` | 1-N | Tin duoc cham diem trong ket qua goi y. |
| `HOSOUNGTUYEN` -> `DANHGIA_CONGTY` | 1-0..1 | Thay cho quan he truc tiep `LICHPHONGVAN` -> `DANHGIA_CONGTY` trong ERD cu. |
| `TINTUYENDUNG` -> `THONGBAO` | 1-N optional | Thong bao co the gan voi tin tuyen dung. |

## 4. Rang buoc va index nen ghi trong ERD

| Bang | Rang buoc/index | Ly do |
|---|---|---|
| `NGUOIDUNG` | UNIQUE(`email`) | Moi email chi co mot tai khoan. |
| `UNGVIEN` | UNIQUE(`maNguoiDung`) | Moi nguoi dung ung vien co mot ho so ung vien. |
| `NHATUYENDUNG` | UNIQUE(`maNguoiDung`) | Moi nguoi dung nha tuyen dung co mot ho so cong ty. |
| `DANHMUC_KYNANG` | UNIQUE(`tenKyNang`) | Khong trung ten ky nang. |
| `HOSOUNGTUYEN` | UNIQUE(`maUngVien`, `maTinTuyenDung`) | Ung vien chi ung tuyen mot lan cho mot tin. |
| `LICHPHONGVAN` | UNIQUE(`maHoSoUngTuyen`) | Moi ho so ung tuyen toi da mot lich phong van hien tai. |
| `DANHGIA_CONGTY` | UNIQUE sparse(`maHoSoUngTuyen`) | Moi ho so ung tuyen toi da mot danh gia cong ty. |
| `VIEC_LAM_DA_LUU` | UNIQUE(`maNguoiDung`, `maTinTuyenDung`) | Khong luu trung mot tin. |
| `TINTUYENDUNG` | TEXT INDEX(`tieuDe`, `moTa`, `yeuCau`) | Tim kiem viec lam theo noi dung. |
| `THONGBAO` | INDEX(`maNguoiDung`, `daDoc`, `ngayTao`), TTL(`hetHan`) | Lay notification nhanh va tu dong het han. |
| `CUOC_TRO_CHUYEN` | INDEX(`nguoiThamGia`, `ngayCapNhat`), INDEX(`maHoSoUngTuyen`), INDEX(`daLuuTru`) | Sap xep chat, loc chat theo ho so, an luu tru. |
| `TIN_NHAN` | INDEX(`maCuocTroChuyenId`, `ngayTao`), INDEX(`nguoiGui`), INDEX(`daXoa`) | Tai tin nhan theo phong chat va loc tin da xoa. |
| `GOI_Y_VIEC_LAM` | INDEX(`maUngVien`, `lanQuet`) | Lay lan quet AI gan nhat cua ung vien. |

## 5. Ghi chu khi ve ERD tu Mongo sang quan he

| Nhom du lieu | Cach trong code Mongo | Cach nen ve ERD |
|---|---|---|
| `UngVien.kyNang`, `TinTuyenDung.kyNang` | Embedded array | Giu cac bang trung gian `UNGVIEN_KYNANG`, `TINTUYENDUNG_KYNANG`. |
| `HoSoNangLuc` nested arrays | Embedded array/object | Tach thanh bang con neu can chi tiet; neu muon ERD gon thi ghi kieu `JSON/TEXT`. |
| `ThongBao.hanhDong` | Embedded array | Co the ve thanh `THONGBAO_HANHDONG` neu can day du, hoac de `hanhDong JSON`. |
| `CuocTroChuyen.nguoiThamGia`, `quanTriNhom` | Mang ObjectId | Nen tach thanh bang N-N. |
| `TinNhan.tepDinhKem`, `daDuocDocBoi`, `phanUng` | Embedded array | Nen tach thanh bang con nhu muc 2. |
| `GoiYViecLam.ketQua` | Embedded array | Nen tach `GOIYVIECLAM_KETQUA`. |

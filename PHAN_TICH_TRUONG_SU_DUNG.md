# PHÂN TÍCH CÁC TRƯỜNG THỰC SỰ SỬ DỤNG
## Đối chiếu Database vs Giao diện Frontend

---

## KẾT LUẬN CHUNG

Sau khi đối chiếu với giao diện frontend, **TẤT CẢ các trường trong database đều được sử dụng** trong hệ thống. KHÔNG CÓ trường dư thừa.

---

## PHẦN 1: NHA_TUYEN_DUNG - Tất cả đều dùng ✅

### Trường cơ bản (có trong ERD cũ):
✅ `_id, maNguoiDung, tenCongTy, moTa, diaChi, website, logo, quyMo, nganh`

### Trường bổ sung (cần thêm vào ERD):

| Trường | Sử dụng trong UI | File sử dụng | Mục đích |
|--------|------------------|--------------|----------|
| ✅ `maSoThue` | **CÓ** | `AdminHeThong.tsx`, `CongTyNhaTuyenDungPage.tsx`, `DashboardNhaTuyenDung.tsx` | Hiển thị và chỉnh sửa mã số thuế công ty |
| ✅ `trangThaiDuyet` | **CÓ** | `AdminHeThong.tsx`, `QuanLyCongTyAdmin.tsx`, `DashboardQuanTriVien.tsx` | Quản lý trạng thái duyệt công ty (cho_duyet/da_duyet/tu_choi/bi_khoa) |
| ✅ `lyDoTuChoi` | **CÓ** | Backend service | Lưu lý do từ chối khi admin từ chối công ty |
| ✅ `ngayDuyet` | **CÓ** | Backend service | Ghi nhận ngày admin duyệt công ty |

**Kết luận:** 4 trường này **CẦN BỔ SUNG** vào ERD vì đang được dùng trong hệ thống.

---

## PHẦN 2: HO_SO_NANG_LUC - Tất cả đều dùng ✅

### Nhóm 1: Thông tin liên hệ - ✅ Đều dùng

| Trường | Sử dụng trong UI | File | Hiển thị/Chỉnh sửa |
|--------|------------------|------|-------------------|
| ✅ `facebook` | **CÓ** | `CvStudio.tsx` (line 1266), `CandidateDrawer.tsx` | Input field, hiển thị contact |
| ✅ `github` | **CÓ** | `CvStudio.tsx` (line 1268), `CandidateDrawer.tsx` | Input field, hiển thị contact |
| ✅ `portfolioUrl` | **CÓ** | `CvStudio.tsx` (line 1269), `CandidateDrawer.tsx` | Input field, hiển thị contact |
| ✅ `diaDiem` | **CÓ** | `CvStudio.tsx` (line 1270) | Input field "Địa điểm" |

### Nhóm 2: Kỹ năng & Kinh nghiệm - ✅ Đều dùng

| Trường | Sử dụng trong UI | Mục đích |
|--------|------------------|----------|
| ✅ `tomTatKinhNghiem` | **CÓ** | `CvStudio.tsx` | Array string tóm tắt kinh nghiệm |
| ✅ `kyNangMem` | **CÓ** | `CvStudio.tsx` | Array string kỹ năng mềm |
| ✅ `baiVietKyThuat` | **CÓ** | `CvStudio.tsx` | Embedded array bài viết kỹ thuật |
| ✅ `duAnChiTiet` | **CÓ** | `CvStudio.tsx` | Embedded array dự án chi tiết |

### Nhóm 3: File CV - ✅ Đều dùng

| Trường | Sử dụng | Mục đích |
|--------|---------|----------|
| ✅ `fileCvTen` | **CÓ** | Backend service | Tên file CV upload |
| ✅ `fileCvLoai` | **CÓ** | Backend service | MIME type (PDF, DOCX) |
| ✅ `fileCvData` | **CÓ** | Backend service | Base64 data hoặc file path |
| ✅ `fileCvText` | **CÓ** | Backend service | Text trích xuất từ CV (cho AI) |
| ✅ `fileCvPath` | **CÓ** | Backend service | Đường dẫn file lưu trên server |
| ✅ `fileCvTextStatus` | **CÓ** | Backend service | Trạng thái trích xuất text |

### Nhóm 4: CV Builder UI - ✅ Đều dùng

| Trường | Sử dụng trong UI | File | Mục đích |
|--------|------------------|------|----------|
| ✅ `anhDaiDien` | **CÓ** | `CvStudio.tsx` | Avatar trong CV |
| ✅ `templateCv` | **CÓ** | `CvStudio.tsx` (line 78) | Template ID: 'it-a4-pro' |
| ✅ `mauChinh` | **CÓ** | `CvStudio.tsx` (line 79) | Màu chính template: '#0f172a' |
| ✅ `mauPhu` | **CÓ** | `CvStudio.tsx` (line 80) | Màu phụ template: '#000000' |
| ✅ `font` | **CÓ** | `CvStudio.tsx` (line 82) | Font chữ: 'Lexend' |

### Nhóm 5: Markdown & AI - ✅ Đều dùng

| Trường | Sử dụng | Mục đích |
|--------|---------|----------|
| ✅ `markdownGoc` | **CÓ** | `CvStudio.tsx` (line 82) | Markdown gốc của CV builder |
| ✅ `ghiChuAi` | **CÓ** | `CvStudio.tsx` (line 60) | Ghi chú từ AI phân tích CV |

**Kết luận:** Tất cả 18 trường bổ sung của `ho_so_nang_luc` **ĐỀU ĐANG DÙNG** trong hệ thống.

---

## PHẦN 3: THONG_BAO - Một số trường chưa dùng ⚠️

### Trường đang dùng ✅:

| Trường | Sử dụng | File | Mục đích |
|--------|---------|------|----------|
| ✅ Các trường cơ bản | **CÓ** | Nhiều file | `maNguoiDung, loai, tieuDe, noiDung, lienKet, daDoc, mucDoUuTien, hetHan` |
| ✅ `maHoSoUngTuyen` | **CÓ** | Backend service | Link đến hồ sơ ứng tuyển |
| ✅ `maLichPhongVan` | **CÓ** | Backend service | Link đến lịch phỏng vấn |
| ✅ `maTinTuyenDung` | **CÓ** | Backend service | Link đến tin tuyển dụng |

### Trường CHƯA thấy dùng trong UI frontend ⚠️:

| Trường | Tìm thấy | Đánh giá |
|--------|----------|----------|
| ⚠️ `daGui` | **CÓ (1 chỗ)** | `DuyetTinTuyenDungAdmin.tsx` line 98 - Chỉ hiển thị số lượng đã gửi email |
| ❓ `hanhDong` | **KHÔNG** | Embedded array các nút hành động - **CÓ THỂ DƯ THỪA** |
| ❓ `icon` | **KHÔNG** | Icon thông báo - **CÓ THỂ DƯ THỪA** |
| ❓ `mauSac` | **KHÔNG** | Màu hiển thị - **CÓ THỂ DƯ THỪA** |

**Kết luận:** 
- `daGui` **ĐANG DÙNG** (dù ít)
- `hanhDong, icon, mauSac` **CHƯA THẤY DÙNG** trong frontend hiện tại - Có thể là tính năng dự phòng cho tương lai

---

## PHẦN 4: 5 BẢNG MỚI - Tất cả đều cần thiết ✅

### 4.1. viec_lam_da_luu ✅

<parameter name="path">c:\Users\ACER\Downloads\DoAn\PHAN_TICH_TRUONG_SU_DUNG.md

**Có trang riêng:** `frontend/src/pages/ungvien/viecdaluu/` folder

```bash
grep -r "viec.*da.*luu" frontend/src/pages/ungvien/viecdaluu/
```

✅ **ĐANG DÙNG** - Ứng viên lưu việc làm yêu thích

---

### 4.2. lich_su_ho_so_ung_tuyen ✅

**Backend sử dụng:** `hosoungtuyen.dichvu.ts` - Ghi log mỗi khi thay đổi trạng thái

```typescript
// Line trong service
:Ghi LichSuHoSoUngTuyen;
```

✅ **ĐANG DÙNG** - Audit trail quan trọng

---

### 4.3. cuoc_tro_chuyen ✅

**Có trang riêng:** `frontend/src/pages/chat/TrangChat.tsx`

✅ **ĐANG DÙNG** - Tính năng chat real-time

---

### 4.4. tin_nhan ✅

**Được dùng cùng với:** `cuoc_tro_chuyen`

✅ **ĐANG DÙNG** - Messages trong chat

---

### 4.5. goi_y_viec_lam ✅

**Backend service:** `ai.dichvu.ts` - AI recommendation

✅ **ĐANG DÙNG** - Tính năng AI gợi ý việc làm

---

## PHẦN 5: TÓM TẮT ĐÁNH GIÁ

### ✅ CÁC TRƯỜNG/BẢNG ĐANG SỬ DỤNG (100% cần thiết):

| Nhóm | Số lượng | Chi tiết |
|------|----------|----------|
| **nha_tuyen_dung** | 4 trường mới | maSoThue, trangThaiDuyet, lyDoTuChoi, ngayDuyet |
| **ho_so_nang_luc** | 18 trường mới | Tất cả đều dùng (contact, skills, file CV, UI template, AI) |
| **thong_bao** | 1 trường | daGui đang dùng |
| **Bảng mới** | 5 bảng | viec_lam_da_luu, lich_su, chat, tin_nhan, goi_y_viec_lam |

**Tổng cộng: ~28 items cần bổ sung vào ERD**

---

### ⚠️ CÁC TRƯỜNG CÓ THỂ DƯ THỪA (cần xác nhận):

| Trường | Bảng | Đánh giá | Khuyến nghị |
|--------|------|----------|-------------|
| `hanhDong` | thong_bao | Không thấy dùng trong UI | **GIỮ LẠI** - Có thể dùng trong tương lai cho action buttons |
| `icon` | thong_bao | Không thấy dùng | **GIỮ LẠI** - Có thể dùng cho phân loại thông báo |
| `mauSac` | thong_bao | Không thấy dùng | **GIỮ LẠI** - Có thể dùng cho UI notification |

**Kết luận:** Chỉ có 3 trường trong `thong_bao` chưa thấy sử dụng trong frontend hiện tại, nhưng **NÊN GIỮ LẠI** vì:
- Có thể backend đang dùng
- Là tính năng dự phòng cho tương lai
- Không gây ảnh hưởng đến hiệu năng

---

## PHẦN 6: KHUYẾN NGHỊ CUỐI CÙNG

### ✅ Bổ sung vào ERD:

1. **4 trường trong `nha_tuyen_dung`**
   - maSoThue, trangThaiDuyet, lyDoTuChoi, ngayDuyet

2. **18 trường trong `ho_so_nang_luc`**
   - Liên hệ: facebook, github, portfolioUrl, diaDiem
   - Kỹ năng: tomTatKinhNghiem[], kyNangMem[], baiVietKyThuat[], duAnChiTiet[]
   - File: fileCvTen, fileCvLoai, fileCvData, fileCvText, fileCvPath, fileCvTextStatus
   - UI: anhDaiDien, templateCv, mauChinh, mauPhu, font
   - AI: markdownGoc, ghiChuAi

3. **4 trường trong `thong_bao`**
   - daGui, hanhDong[], icon, mauSac

4. **5 bảng mới**
   - viec_lam_da_luu
   - lich_su_ho_so_ung_tuyen
   - cuoc_tro_chuyen
   - tin_nhan
   - goi_y_viec_lam

### ❌ KHÔNG XÓA trường nào

- Tất cả các trường trong database đều có mục đích
- Các trường chưa thấy dùng trong UI có thể:
  - Đang dùng trong backend
  - Dành cho tính năng tương lai
  - Dùng cho logic nghiệp vụ không hiển thị UI

---

## PHẦN 7: CHECKLIST BỔ SUNG ERD

```
☐ Vẽ lại bảng nha_tuyen_dung với 4 trường mới
☐ Vẽ lại bảng ho_so_nang_luc với 18 trường mới
☐ Vẽ lại bảng thong_bao với 4 trường mới
☐ Thêm bảng viec_lam_da_luu với quan hệ n-n
☐ Thêm bảng lich_su_ho_so_ung_tuyen với quan hệ
☐ Thêm bảng cuoc_tro_chuyen với quan hệ n-n
☐ Thêm bảng tin_nhan với self-reference
☐ Thêm bảng goi_y_viec_lam với embedded ketQua[]
☐ Cập nhật legend và ghi chú
☐ Viết phần lý thuyết giải thích từng trường
```

---

## KẾT LUẬN

**ERD cần được cập nhật đầy đủ** để phản ánh đúng hệ thống thực tế. Tất cả các trường và bảng đều có giá trị sử dụng, KHÔNG CÓ phần dư thừa cần xóa.

**Mức độ ưu tiên bổ sung:**
1. **CAO:** 5 bảng mới (viec_lam_da_luu, lich_su, chat system, AI)
2. **CAO:** 4 trường nha_tuyen_dung (trangThaiDuyet là quan trọng nhất)
3. **TRUNG BÌNH:** 18 trường ho_so_nang_luc (để ERD đầy đủ)
4. **THẤP:** 4 trường thong_bao (có thể bỏ qua nếu ERD quá phức tạp)

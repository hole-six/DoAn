# Quy Tac Chung Toan He Thong

Tai lieu nay la nguon quy tac duy nhat cho du an.
Tat ca module, ten file, ten bien, frontend, backend, API, mapping ERD va quy tac giao dien deu theo file nay.

## 1. Quy Tac Dat Ten

- Ten code bat buoc dung tieng Viet khong dau.
- Khong dung dau gach ngang trong ten file `.ts`, `.tsx` va ten thu muc module.
- Khong dung khoang trang trong ten file ma nguon.
- Ten file `.ts`/`.tsx` dat lien, chi dung dau cham de tach vai tro file.
- Ten ham va bien dung `camelCase`.
- Ten type/interface/schema dung `PascalCase`.
- Ten collection MongoDB dung `snake_case`.
- Ten route API dung duong dan tieng Viet khong dau, khong dau gach ngang.

### Mau ten module backend

```txt
src/modules/<tenmodule>/
  <tenmodule>.mohinh.ts
  <tenmodule>.dichvu.ts
  <tenmodule>.dieukhien.ts
  <tenmodule>.dinhtuyen.ts
  <tenmodule>.kiemtra.ts
```

Vi du:

- `nguoidung.mohinh.ts`
- `tintuyendung.dichvu.ts`
- `hosoungtuyen.dieukhien.ts`

Mau ten frontend:

- `khoitao.tsx` (entry)
- `ungdung.tsx` (root app)
- `ungdung.css`, `nenchung.css`

## 2. Quy Tac Kien Truc Backend

Kien truc bat buoc: `model -> service -> controller -> router`.

- `mohinh`: dinh nghia schema + index + enum.
- `dichvu`: xu ly truy van DB, business logic.
- `dieukhien`: nhan request, goi dichvu, tra response.
- `dinhtuyen`: khai bao endpoint cho module.
- `kiemtra`: schema validation cho tao/cap nhat.

Nen tang dung chung:

- `dungchung/dichvucoban.ts`
- `dungchung/dieukhiencoban.ts`
- `dungchung/dinhtuyencoban.ts`
- `dungchung/batloibatdongbo.ts`
- `dungchung/xulyloi.ts`

Khoi tao app:

- `ungdung.ts` cho middleware va route.
- `maychu.ts` cho ket noi DB va listen cong.

## 3. Quy Tac Module Theo ERD

Module bat buoc:

1. `nguoidung`
2. `ungvien`
3. `hosonangluc`
4. `nhatuyendung`
5. `tintuyendung`
6. `danhmuckynang`
7. `hosoungtuyen`
8. `lichsuhosoungtuyen`
9. `lichphongvan`
10. `thongbao`
11. `danhgiacongty`

Mapping collection:

- `nguoidung` -> `nguoi_dung`
- `ungvien` -> `ung_vien`
- `hosonangluc` -> `ho_so_nang_luc`
- `nhatuyendung` -> `nha_tuyen_dung`
- `tintuyendung` -> `tin_tuyen_dung`
- `danhmuckynang` -> `danh_muc_ky_nang`
- `hosoungtuyen` -> `ho_so_ung_tuyen`
- `lichsuhosoungtuyen` -> `lich_su_ho_so_ung_tuyen`
- `lichphongvan` -> `lich_phong_van`
- `thongbao` -> `thong_bao`
- `danhgiacongty` -> `danh_gia_cong_ty`

## 4. Quy Tac API

Prefix chung: `/api`.

Danh sach route module:

- `/api/nguoidung`
- `/api/ungvien`
- `/api/hosonangluc`
- `/api/nhatuyendung`
- `/api/tintuyendung`
- `/api/danhmuckynang`
- `/api/hosoungtuyen`
- `/api/lichsuhosoungtuyen`
- `/api/lichphongvan`
- `/api/thongbao`
- `/api/danhgiacongty`

## 5. Quy Tac Frontend Theo Vai Tro

### Ung vien

- Dashboard, ho so nang luc, viec da luu, ho so ung tuyen, lich phong van, thong bao, cai dat.

### Nha tuyen dung

- Dashboard, quan ly tin, tao tin, pipeline ung vien, lich phong van, thong tin cong ty, pricing, analytics, thong bao, cai dat.

### Admin

- Dashboard, quan ly nguoi dung, cong ty, tin tuyen dung, danh muc ky nang, analytics, review, cai dat, logs.

## 6. Quy Tac Giao Dien (Design System)

Nhan dien thuong hieu:

- Phong cach modern corporate, sach, ro, nhieu khoang trang.
- Ton mau chinh:
  - `#0b1c30` (navy)
  - `#0058be` (secondary)
  - `#2170e4` (secondary hover)
  - `#f8f9ff` (surface)
  - `#ffffff` (card)
- Font:
  - Heading: `Montserrat`
  - Body: `Inter`
- Bo goc:
  - Card/Input/Button: 12px
- Shadow:
  - nhe, mau navy do mo thap

Quy tac UI:

- Button primary dung xanh secondary.
- Input focus co vien xanh ro rang.
- Card co border nhe + shadow nhe.
- Layout desktop theo container 1280, mobile stack 1 cot.
- Role portal dung chung mot dashboard shell, tach man hinh theo route.

## 7. Quy Tac Thuc Thi

- Moi thay doi code phai khong lam vi pham quy tac ten.
- Neu tao file moi ma co dau gach ngang trong ten `.ts`/`.tsx` thi xem la sai quy tac.
- Moi module moi bat buoc du 5 file chuan (`mohinh`, `dichvu`, `dieukhien`, `dinhtuyen`, `kiemtra`).
- Khi co mau thuan tai lieu, `DESIGN.md` la ban co hieu luc cao nhat.

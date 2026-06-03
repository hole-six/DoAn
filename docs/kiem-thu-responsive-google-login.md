# Kiem thu responsive va Google Login

## Viewport can test

- Mobile nho: 360 x 740
- Mobile pho bien: 390 x 844
- Mobile lon: 430 x 932
- Tablet: 768 x 1024
- Desktop: 1366 x 768

## Dieu kien truoc khi test

- Frontend build bang dung env production:
  - `VITE_API_URL=https://effortit.site/api`
  - `VITE_PUBLIC_URL=https://effortit.site`
  - `VITE_SOCKET_URL=https://effortit.site`
  - `VITE_GOOGLE_CLIENT_ID=<Google OAuth Web Client ID>`
- Backend co:
  - `GOOGLE_CLIENT_ID=<cung Web Client ID voi frontend>`
- Google Cloud OAuth Web client them Authorized JavaScript origins:
  - `https://effortit.site`
  - `https://www.effortit.site`

## Public routes

- `/`
- `/viec-lam`
- `/viec-lam/:id`
- `/cong-ty`
- `/cong-ty/:id`
- `/blog`
- `/luong`
- `/gioi-thieu`
- `/lien-he`
- `/dieu-khoan`
- `/bao-mat`

Can kiem tra tren moi viewport:

- Khong co thanh scroll ngang o body.
- Header khong de logo/menu/action chong len nhau.
- Search box xuong cot tren mobile.
- Card viec lam/cong ty khong tran text.
- Nut CTA khong vuot khoi man hinh.
- Trang chi tiet co sidebar xuong duoi noi dung tren mobile.

## Auth routes

- `/dang-nhap`
- `/dang-ky`
- `/quen-mat-khau`

Can kiem tra:

- Form vua man hinh 360px.
- Tab vai tro khong tran.
- Nut Google khong tran khi `VITE_GOOGLE_CLIENT_ID` da duoc cau hinh.
- Dang nhap role mau dieu huong dung dashboard.

## Ung vien

- `/ung-vien`
- `/ung-vien/ho-so`
- `/ung-vien/viec-da-luu`
- `/ung-vien/ung-tuyen`
- `/ung-vien/lich-phong-van`
- `/ung-vien/chat`
- `/ung-vien/thong-bao`
- `/ung-vien/cai-dat`

Can kiem tra:

- Sidebar thanh drawer/mobile topbar.
- Bottom nav khong che nut quan trong.
- KPI, panel, form CV, drawer, modal xuong mot cot.
- Bang/danh sach co cuon ngang noi bo neu cot qua nhieu.
- Chat chuyen tu danh sach sang noi dung ro rang tren mobile.

## Nha tuyen dung

- `/nha-tuyen-dung/dashboard`
- `/nha-tuyen-dung/quan-ly-tin`
- `/nha-tuyen-dung/ung-vien`
- `/nha-tuyen-dung/lich-phong-van`
- `/nha-tuyen-dung/cong-ty`
- `/nha-tuyen-dung/chat`
- `/nha-tuyen-dung/thong-bao`
- `/nha-tuyen-dung/bang-gia`

Can kiem tra:

- Form tao/sua tin khong tran.
- Modal job va drawer ung vien vua man hinh mobile.
- Pipeline ung vien co cuon noi bo neu can.
- Bang gia xuong mot cot tren mobile.

## Quan tri

- `/quan-tri/dashboard`
- `/quan-tri/nguoi-dung`
- `/quan-tri/cong-ty`
- `/quan-tri/tin-tuyen-dung`
- `/quan-tri/ky-nang`
- `/quan-tri/review`
- `/quan-tri/chat`

Can kiem tra:

- Bang quan tri cuon ngang noi bo, khong day body tran ngang.
- Nut phe duyet/xoa/sua khong chong nhau.
- Filter va form xuong mot cot tren mobile.
- Chat admin dung layout mobile.

## Chat noi he thong

Can test ca popup chat va trang chat rieng:

- Popup chat tren mobile mo full screen.
- Khung nhap khong bi bottom nav/keyboard che mat.
- Bong tin nhan tu xuong dong voi text dai.
- Danh sach hoi thoai va noi dung chat khong hien cung luc tren mobile.

## Lenh test nhanh sau deploy

```bash
curl -I https://effortit.site
curl -i https://effortit.site/api/trangthai
curl -i https://effortit.site/api/deploy/health
```


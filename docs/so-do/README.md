# Bộ Sơ Đồ Phân Tích Thiết Kế EffortIT

Thư mục này chứa bộ sơ đồ PlantUML phục vụ báo cáo phân tích thiết kế hệ thống tuyển dụng IT EffortIT. Bộ sơ đồ chính bám theo 25 usecase lõi và được chia thành các nhóm học thuật: usecase, activity, sequence, robustness và ERD.

Tài liệu chính:

- [Danh mục sơ đồ](00-tai-lieu/danh-muc-so-do.md)
- [Phân tích thiết kế hệ thống](00-tai-lieu/phan-tich-thiet-ke-he-thong.md)
- [Bảng mô tả dữ liệu ERD](00-tai-lieu/bang-du-lieu-erd.md)

Cấu trúc:

- `01-usecase/`: sơ đồ usecase tổng quan và usecase theo actor.
- `02-activity/`: sơ đồ hoạt động cho từng usecase lõi.
- `03-sequence/`: sơ đồ tuần tự mô tả actor, giao diện, bộ xử lý và MongoDB.
- `04-robustness/`: sơ đồ robustness theo mô hình Boundary, Control, Entity.
- `05-erd-du-lieu/`: sơ đồ ERD tổng quan và ERD theo nhóm dữ liệu.
- `00-tai-lieu/`: tài liệu phân tích, danh mục sơ đồ và bảng mô tả collection dữ liệu.

Các sơ đồ phụ về AI, chat realtime, class/component và deployment không nằm trong danh mục báo cáo chính để tài liệu Word tập trung vào nghiệp vụ tuyển dụng.

Render bằng PlantUML extension trong VS Code hoặc lệnh:

```bash
plantuml docs/so-do/**/*.puml
```

Xuất PNG nét cao cho 3 nhóm `activity + sequence + robustness` và gom toàn bộ ảnh vào một thư mục:

```bash
node docs/export-png/render.mjs
```

Một số tuỳ chọn hữu ích:

```bash
node docs/export-png/render.mjs --out all-highres --dpi 300
node docs/export-png/render.mjs --split
node docs/export-png/render.mjs --include-usecase --include-erd
```

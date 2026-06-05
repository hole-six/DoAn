# Bộ Sơ Đồ Phân Tích Thiết Kế EffortIT

Thư mục này chứa bộ sơ đồ PlantUML phục vụ báo cáo phân tích thiết kế hệ thống tuyển dụng IT EffortIT. Bộ sơ đồ được chia theo nhóm học thuật: use-case, activity, sequence, robustness, ERD, class/component và deployment.

Tài liệu chính:

- [Danh mục sơ đồ](00-tai-lieu/danh-muc-so-do.md)
- [Phân tích thiết kế hệ thống](00-tai-lieu/phan-tich-thiet-ke-he-thong.md)

Cấu trúc:

- `01-usecase/`: sơ đồ use-case theo tác nhân.
- `02-activity/`: luồng nghiệp vụ chính.
- `03-sequence/`: tương tác frontend, backend, database, dịch vụ ngoài.
- `04-robustness/`: boundary, control, entity cho các use-case trọng tâm.
- `05-erd-du-lieu/`: mô hình dữ liệu.
- `06-class-component/`: class/module backend và component frontend/backend.
- `07-deployment/`: triển khai production VPS và webhook deploy.

Render bằng PlantUML extension trong VS Code hoặc lệnh:

```bash
plantuml docs/so-do/**/*.puml
```

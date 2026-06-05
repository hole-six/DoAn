# Danh Mục Sơ Đồ EffortIT

Bộ tài liệu gồm 56 sơ đồ PlantUML, bám theo hệ thống EffortIT: tuyển dụng IT tại Đà Nẵng, ứng viên, nhà tuyển dụng, quản trị viên, CV/hồ sơ năng lực, duyệt tin, lịch phỏng vấn, chat realtime, thông báo và trợ lý AI Gemini.

## 1. Use-Case

| STT | File | Caption |
|---:|---|---|
| 1 | `01-usecase/01-usecase-tong-quan.puml` | Hình 1.1: Sơ đồ use-case tổng quan hệ thống EffortIT |
| 2 | `01-usecase/02-usecase-khach-vang-lai.puml` | Hình 1.2: Sơ đồ use-case khách vãng lai |
| 3 | `01-usecase/03-usecase-ung-vien.puml` | Hình 1.3: Sơ đồ use-case ứng viên |
| 4 | `01-usecase/04-usecase-nha-tuyen-dung.puml` | Hình 1.4: Sơ đồ use-case nhà tuyển dụng |
| 5 | `01-usecase/05-usecase-quan-tri-vien.puml` | Hình 1.5: Sơ đồ use-case quản trị viên |
| 6 | `01-usecase/06-usecase-ai-chatbot.puml` | Hình 1.6: Sơ đồ use-case trợ lý AI Gemini |

## 2. Activity

| STT | File | Caption |
|---:|---|---|
| 1 | `02-activity/01-activity-dang-ky-ung-vien.puml` | Hình 2.1: Quy trình đăng ký ứng viên |
| 2 | `02-activity/02-activity-dang-ky-nha-tuyen-dung.puml` | Hình 2.2: Quy trình đăng ký nhà tuyển dụng |
| 3 | `02-activity/03-activity-dang-nhap.puml` | Hình 2.3: Quy trình đăng nhập JWT |
| 4 | `02-activity/04-activity-google-login.puml` | Hình 2.4: Quy trình đăng nhập Google |
| 5 | `02-activity/05-activity-quen-mat-khau.puml` | Hình 2.5: Quy trình quên mật khẩu bằng email token |
| 6 | `02-activity/06-activity-tim-kiem-viec-lam.puml` | Hình 2.6: Quy trình tìm kiếm và lọc việc làm |
| 7 | `02-activity/07-activity-quan-ly-cv.puml` | Hình 2.7: Quy trình quản lý CV/hồ sơ năng lực |
| 8 | `02-activity/08-activity-ung-tuyen.puml` | Hình 2.8: Quy trình ứng tuyển |
| 9 | `02-activity/09-activity-luu-viec-lam.puml` | Hình 2.9: Quy trình lưu việc làm |
| 10 | `02-activity/10-activity-cap-nhat-cong-ty.puml` | Hình 2.10: Quy trình cập nhật hồ sơ công ty |
| 11 | `02-activity/11-activity-dang-tin-tuyen-dung.puml` | Hình 2.11: Quy trình đăng tin tuyển dụng |
| 12 | `02-activity/12-activity-duyet-cong-ty.puml` | Hình 2.12: Quy trình duyệt công ty |
| 13 | `02-activity/13-activity-duyet-tin-tuyen-dung.puml` | Hình 2.13: Quy trình duyệt tin tuyển dụng |
| 14 | `02-activity/14-activity-moi-phong-van.puml` | Hình 2.14: Quy trình mời phỏng vấn |
| 15 | `02-activity/15-activity-cap-nhat-ket-qua-phong-van.puml` | Hình 2.15: Quy trình cập nhật kết quả phỏng vấn |
| 16 | `02-activity/16-activity-chat-realtime.puml` | Hình 2.16: Quy trình chat realtime |
| 17 | `02-activity/17-activity-thong-bao-he-thong.puml` | Hình 2.17: Quy trình thông báo hệ thống |
| 18 | `02-activity/18-activity-gemini-chatbot-fallback.puml` | Hình 2.18: Quy trình hỏi AI Gemini và fallback database |

## 3. Sequence

| STT | File | Caption |
|---:|---|---|
| 1 | `03-sequence/01-sequence-dang-nhap-jwt.puml` | Hình 3.1: Sequence đăng nhập JWT |
| 2 | `03-sequence/02-sequence-google-login.puml` | Hình 3.2: Sequence Google Login |
| 3 | `03-sequence/03-sequence-quen-mat-khau.puml` | Hình 3.3: Sequence quên mật khẩu |
| 4 | `03-sequence/04-sequence-tim-kiem-viec-lam.puml` | Hình 3.4: Sequence tìm kiếm việc làm |
| 5 | `03-sequence/05-sequence-ung-tuyen.puml` | Hình 3.5: Sequence ứng tuyển |
| 6 | `03-sequence/06-sequence-upload-cv.puml` | Hình 3.6: Sequence upload CV |
| 7 | `03-sequence/07-sequence-dang-tin-cho-duyet.puml` | Hình 3.7: Sequence đăng tin chờ duyệt |
| 8 | `03-sequence/08-sequence-admin-duyet-tin.puml` | Hình 3.8: Sequence quản trị viên duyệt tin |
| 9 | `03-sequence/09-sequence-moi-phong-van.puml` | Hình 3.9: Sequence mời phỏng vấn |
| 10 | `03-sequence/10-sequence-chat-realtime.puml` | Hình 3.10: Sequence chat realtime |
| 11 | `03-sequence/11-sequence-thong-bao.puml` | Hình 3.11: Sequence thông báo |
| 12 | `03-sequence/12-sequence-gemini-chatbot.puml` | Hình 3.12: Sequence trợ lý AI Gemini |

## 4. Robustness

| STT | File | Caption |
|---:|---|---|
| 1 | `04-robustness/01-robustness-dang-nhap.puml` | Hình 4.1: Robustness đăng nhập |
| 2 | `04-robustness/02-robustness-quen-mat-khau.puml` | Hình 4.2: Robustness quên mật khẩu |
| 3 | `04-robustness/03-robustness-ung-tuyen.puml` | Hình 4.3: Robustness ứng tuyển |
| 4 | `04-robustness/04-robustness-dang-tin-duyet-tin.puml` | Hình 4.4: Robustness đăng tin và duyệt tin |
| 5 | `04-robustness/05-robustness-lich-phong-van.puml` | Hình 4.5: Robustness lịch phỏng vấn |
| 6 | `04-robustness/06-robustness-chat-realtime.puml` | Hình 4.6: Robustness chat realtime |
| 7 | `04-robustness/07-robustness-gemini-chatbot.puml` | Hình 4.7: Robustness Gemini chatbot |

## 5. ERD Dữ Liệu

| STT | File | Caption |
|---:|---|---|
| 1 | `05-erd-du-lieu/01-erd-tong-quan-effortit.puml` | Hình 5.1: ERD tổng quan EffortIT |
| 2 | `05-erd-du-lieu/02-erd-xac-thuc-nguoi-dung.puml` | Hình 5.2: ERD xác thực người dùng |
| 3 | `05-erd-du-lieu/03-erd-tuyen-dung.puml` | Hình 5.3: ERD nghiệp vụ tuyển dụng |
| 4 | `05-erd-du-lieu/04-erd-chat-thong-bao.puml` | Hình 5.4: ERD chat và thông báo |
| 5 | `05-erd-du-lieu/05-erd-ai-cv-goi-y.puml` | Hình 5.5: ERD AI, CV và gợi ý |

## 6. Class Và Component

| STT | File | Caption |
|---:|---|---|
| 1 | `06-class-component/01-class-backend-module.puml` | Hình 6.1: Class/module backend tổng quan |
| 2 | `06-class-component/02-class-auth-module.puml` | Hình 6.2: Class module xác thực |
| 3 | `06-class-component/03-class-recruitment-module.puml` | Hình 6.3: Class module tuyển dụng |
| 4 | `06-class-component/04-class-chat-notification-module.puml` | Hình 6.4: Class module chat và thông báo |
| 5 | `06-class-component/05-component-frontend.puml` | Hình 6.5: Component frontend |
| 6 | `06-class-component/06-component-backend.puml` | Hình 6.6: Component backend |

## 7. Deployment

| STT | File | Caption |
|---:|---|---|
| 1 | `07-deployment/01-deployment-production-vps.puml` | Hình 7.1: Deployment production trên VPS |
| 2 | `07-deployment/02-component-deploy-webhook.puml` | Hình 7.2: Component deploy webhook |

## Quy Ước

- Tất cả file dùng UTF-8 và tiếng Việt có dấu.
- Tên actor thống nhất: Khách vãng lai, Ứng viên, Nhà tuyển dụng, Quản trị viên, Gemini API, Hệ thống Email SMTP, MongoDB, Socket.IO.
- Các sơ đồ robustness dùng đúng nhóm Boundary, Control, Entity.
- Khi chèn vào báo cáo Word, dùng caption theo bảng trên để đánh số nhất quán.

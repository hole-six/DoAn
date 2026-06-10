# Bảng Method Cho ERD Mức 2

File này dùng để copy các phương thức vào từng bảng/entity trong sơ đồ ERD mức 2.

## NguoiDung

| STT | Method |
|---:|---|
| 1 | `+getAll()` |
| 2 | `+getById(maNguoiDung)` |
| 3 | `+create(data)` |
| 4 | `+update(maNguoiDung, data)` |
| 5 | `+delete(maNguoiDung)` |
| 6 | `+login(email, matKhau)` |Để xây dựng website quản lý tuyển dụng việc làm công nghệ thông tin tại thành phố Đà Nẵng, đề tài sử dụng các công cụ và công nghệ sau:

- Visual Studio Code: dùng để viết mã nguồn frontend, backend và quản lý cấu trúc dự án.
- Node.js: môi trường thực thi JavaScript phía server.
- Express.js: framework xây dựng REST API cho backend.
- ReactJS: thư viện xây dựng giao diện người dùng phía frontend.
- Vite: công cụ khởi tạo và chạy ứng dụng frontend với tốc độ nhanh.
- TypeScript: hỗ trợ kiểm tra kiểu dữ liệu, giúp mã nguồn rõ ràng và dễ bảo trì hơn.
- PostgreSQL: hệ quản trị cơ sở dữ liệu quan hệ dùng để lưu trữ dữ liệu hệ thống.
- Prisma ORM: công cụ ánh xạ dữ liệu giữa mã nguồn backend và cơ sở dữ liệu PostgreSQL.
- JWT: dùng để xác thực và phân quyền người dùng.
- Socket.IO: hỗ trợ chức năng trò chuyện thời gian thực giữa ứng viên và nhà tuyển dụng.
- Multer: hỗ trợ tải lên hình ảnh, logo công ty, ảnh đại diện và file CV.
- Gemini AI API: hỗ trợ gợi ý việc làm, phân tích hồ sơ và tạo phản hồi thông minh.
- Git và GitHub: quản lý phiên bản mã nguồn và hỗ trợ đồng bộ dự án.

Hệ thống được xây dựng theo mô hình tách biệt frontend và backend. Frontend đảm nhận hiển thị giao diện và tương tác với người dùng, backend xử lý nghiệp vụ, xác thực, phân quyền và giao tiếp với cơ sở dữ liệu.
| 7 | `+loginGoogle(credential)` |
| 8 | `+forgotPassword(email)` |
| 9 | `+resetPassword(token, matKhauMoi)` |
| 10 | `+countLockedAccounts()` |

## UngVien

| STT | Method |
|---:|---|
| 1 | `+getAll()` |
| 2 | `+getById(maUngVien)` |
| 3 | `+getByUser(maNguoiDung)` |
| 4 | `+createDefaultProfile(maNguoiDung)` |
| 5 | `+updateProfile(maUngVien, data)` |
| 6 | `+deleteProfile(maUngVien)` |
| 7 | `+syncSkills(maUngVien, danhSachKyNang)` |
| 8 | `+populateCandidate(maUngVien)` |

## NhaTuyenDung

| STT | Method |
|---:|---|
| 1 | `+getAll()` |
| 2 | `+getById(maNhaTuyenDung)` |
| 3 | `+getByUser(maNguoiDung)` |
| 4 | `+createCompany(data)` |
| 5 | `+updateCompany(maNhaTuyenDung, data)` |
| 6 | `+deleteCompany(maNhaTuyenDung)` |
| 7 | `+approveCompany(maNhaTuyenDung)` |
| 8 | `+rejectCompany(maNhaTuyenDung, lyDo)` |
| 9 | `+countPendingCompanies()` |

## DanhMucKyNang

| STT | Method |
|---:|---|
| 1 | `+getAll()` |
| 2 | `+getById(maKyNang)` |
| 3 | `+createSkill(data)` |
| 4 | `+updateSkill(maKyNang, data)` |
| 5 | `+deleteSkill(maKyNang)` |
| 6 | `+mergeSkill(maNguon, maDich)` |
| 7 | `+checkSkillInUse(maKyNang)` |

## UngVienKyNang

| STT | Method |
|---:|---|
| 1 | `+findByCandidate(maUngVien)` |
| 2 | `+syncByCandidate(maUngVien, danhSachKyNang)` |
| 3 | `+deleteByCandidate(maUngVien)` |
| 4 | `+checkSkillUsed(maKyNang)` |

## TinTuyenDung

| STT | Method |
|---:|---|
| 1 | `+searchJobs(filter)` |
| 2 | `+getAll()` |
| 3 | `+getById(maTin)` |
| 4 | `+getDetail(maTin)` |
| 5 | `+createJob(data)` |
| 6 | `+updateJob(maTin, data)` |
| 7 | `+deleteJob(maTin)` |
| 8 | `+approveJob(maTin)` |
| 9 | `+rejectJob(maTin, lyDo)` |
| 10 | `+reopenJob(maTin)` |
| 11 | `+closeJob(maTin)` |
| 12 | `+countJobAlerts()` |

## TinTuyenDungKyNang

| STT | Method |
|---:|---|
| 1 | `+findByJob(maTin)` |
| 2 | `+syncByJob(maTin, danhSachKyNang)` |
| 3 | `+deleteByJob(maTin)` |
| 4 | `+checkSkillUsed(maKyNang)` |
| 5 | `+aggregateSkillDemand(filter)` |

## HoSoNangLuc

| STT | Method |
|---:|---|
| 1 | `+getByCandidate(maUngVien)` |
| 2 | `+getById(maHoSoNangLuc)` |
| 3 | `+createCv(data)` |
| 4 | `+updateCv(maHoSoNangLuc, data)` |
| 5 | `+deleteCv(maHoSoNangLuc)` |
| 6 | `+setMainCv(maHoSoNangLuc)` |
| 7 | `+uploadAvatar(file)` |
| 8 | `+uploadCvFile(file)` |
| 9 | `+extractPdfText(file)` |

## HoSoUngTuyen

| STT | Method |
|---:|---|
| 1 | `+apply(maTin, maHoSoNangLuc)` |
| 2 | `+quickApply(maTin)` |
| 3 | `+getAll(filter)` |
| 4 | `+getById(maHoSoUngTuyen)` |
| 5 | `+markViewed(maHoSoUngTuyen)` |
| 6 | `+evaluate(maHoSoUngTuyen, trangThai)` |
| 7 | `+updateStatus(maHoSoUngTuyen, trangThai)` |
| 8 | `+withdraw(maHoSoUngTuyen)` |
| 9 | `+scheduleInterview(maHoSoUngTuyen, data)` |

## LichSuHoSoUngTuyen

| STT | Method |
|---:|---|
| 1 | `+createHistory(maHoSoUngTuyen, trangThaiMoi)` |
| 2 | `+getByApplication(maHoSoUngTuyen)` |
| 3 | `+aggregateStatusChanges(filter)` |

## LichPhongVan

| STT | Method |
|---:|---|
| 1 | `+getAll(filter)` |
| 2 | `+getById(maLichPhongVan)` |
| 3 | `+createSchedule(data)` |
| 4 | `+updateSchedule(maLichPhongVan, data)` |
| 5 | `+deleteSchedule(maLichPhongVan)` |
| 6 | `+confirm(maLichPhongVan)` |
| 7 | `+requestReschedule(maLichPhongVan, data)` |
| 8 | `+complete(maLichPhongVan, ketQua)` |
| 9 | `+cancel(maLichPhongVan)` |

## DanhGiaCongTy

| STT | Method |
|---:|---|
| 1 | `+getAll(filter)` |
| 2 | `+getById(maDanhGia)` |
| 3 | `+createReview(data)` |
| 4 | `+createFromApplication(maHoSoUngTuyen, data)` |
| 5 | `+updateReview(maDanhGia, data)` |
| 6 | `+deleteReview(maDanhGia)` |
| 7 | `+approveReview(maDanhGia)` |
| 8 | `+rejectReview(maDanhGia)` |

## DanhGiaPhongVan

| STT | Method |
|---:|---|
| 1 | `+createInterviewReview(data)` |
| 2 | `+getByInterview(maLichPhongVan)` |
| 3 | `+aggregateInterviewReview(filter)` |

## ThongBao

| STT | Method |
|---:|---|
| 1 | `+getAll(maNguoiDung)` |
| 2 | `+getById(maThongBao)` |
| 3 | `+createNotification(data)` |
| 4 | `+markAsRead(maThongBao)` |
| 5 | `+markAllAsRead(maNguoiDung)` |
| 6 | `+countUnread(maNguoiDung)` |
| 7 | `+deleteNotification(maThongBao)` |

## ViecLamDaLuu

| STT | Method |
|---:|---|
| 1 | `+getSavedJobs(maNguoiDung)` |
| 2 | `+saveJob(maNguoiDung, maTin)` |
| 3 | `+unsaveJob(maNguoiDung, maTin)` |
| 4 | `+toggleSaveJob(maNguoiDung, maTin)` |
| 5 | `+getSaveStatus(maNguoiDung, maTin)` |

## CuocTroChuyen

| STT | Method |
|---:|---|
| 1 | `+getConversations(maNguoiDung)` |
| 2 | `+getById(maCuocTroChuyen)` |
| 3 | `+findOrCreateConversation(params)` |
| 4 | `+markConversationRead(maCuocTroChuyen)` |
| 5 | `+updateConversationContext(params)` |
| 6 | `+joinCommunityGroup(maNhom)` |

## TinNhan

| STT | Method |
|---:|---|
| 1 | `+getMessages(maCuocTroChuyen)` |
| 2 | `+sendMessage(data)` |
| 3 | `+deleteMessage(maTinNhan)` |
| 4 | `+addReaction(maTinNhan, emoji)` |
| 5 | `+markMessageRead(maTinNhan)` |

## GoiYViecLam

| STT | Method |
|---:|---|
| 1 | `+getLatestSuggestion(maUngVien)` |
| 2 | `+runSuggestionNow(maUngVien, maHoSoNangLuc)` |
| 3 | `+saveSuggestionResult(data)` |
| 4 | `+runSuggestionCrawler()` |
| 5 | `+sendSuggestionEmail(maUngVien)` |


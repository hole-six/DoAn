# CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG EFFORTIT

## 2.1.2. Liệt kê người dùng và yêu cầu

Hệ thống **EffortIT - Nền tảng tuyển dụng IT tại Đà Nẵng** được xây dựng nhằm kết nối ứng viên công nghệ thông tin với nhà tuyển dụng, đồng thời hỗ trợ quản trị viên kiểm soát chất lượng thông tin, duyệt hồ sơ công ty, duyệt tin tuyển dụng và theo dõi hoạt động toàn hệ thống. Hệ thống phục vụ bốn nhóm người dùng chính: khách vãng lai, ứng viên, nhà tuyển dụng và quản trị viên.

### 2.1.2.1. Khách vãng lai

**Yêu cầu:**

- Có thể xem trang chủ, tìm kiếm việc làm IT, lọc tin tuyển dụng theo từ khóa, kỹ năng, mức lương, hình thức làm việc và cấp bậc.
- Có thể xem danh sách công ty, xem hồ sơ công ty và xem chi tiết tin tuyển dụng.
- Có thể đăng ký tài khoản ứng viên hoặc nhà tuyển dụng, đăng nhập bằng email/mật khẩu hoặc Google.
- Có thể sử dụng các chức năng công khai như xem thông tin việc làm, công ty và nội dung giới thiệu hệ thống.

**Mục tiêu sử dụng:**

- Giúp người tìm việc và doanh nghiệp tiếp cận nhanh thông tin tuyển dụng IT tại Đà Nẵng mà không bắt buộc đăng nhập ngay từ đầu.

### 2.1.2.2. Ứng viên

**Yêu cầu:**

- Đăng ký, đăng nhập, đăng xuất và đặt lại mật khẩu khi quên mật khẩu.
- Quản lý hồ sơ năng lực, tạo CV trực tiếp trên hệ thống, upload CV PDF và đặt CV chính.
- Tìm kiếm việc làm, lưu việc làm, ứng tuyển vào tin tuyển dụng bằng CV đã tạo hoặc CV đã upload.
- Theo dõi trạng thái hồ sơ ứng tuyển, lịch phỏng vấn, kết quả phỏng vấn và thông báo mới.
- Chat với nhà tuyển dụng khi hồ sơ ứng tuyển đã đến các trạng thái cho phép trao đổi.
- Nhận gợi ý việc làm từ AI dựa trên nội dung CV.

**Mục tiêu sử dụng:**

- Giúp ứng viên quản lý toàn bộ quá trình tìm việc, xây dựng CV, nộp hồ sơ, theo dõi phỏng vấn và trao đổi với nhà tuyển dụng trong một môi trường tập trung.

### 2.1.2.3. Nhà tuyển dụng

**Yêu cầu:**

- Đăng ký tài khoản nhà tuyển dụng với thông tin người phụ trách và tên công ty.
- Cập nhật hồ sơ công ty và chờ quản trị viên duyệt trước khi đăng tin tuyển dụng.
- Tạo, sửa, gửi duyệt, tạm đóng hoặc mở lại tin tuyển dụng khi công ty đã được duyệt.
- Xem pipeline ứng viên, xem CV/hồ sơ năng lực, đánh giá hồ sơ, mời phỏng vấn hoặc từ chối ứng viên.
- Cập nhật lịch phỏng vấn, ghi nhận kết quả đạt/không đạt sau phỏng vấn.
- Chat với ứng viên trong đúng ngữ cảnh hồ sơ ứng tuyển và nhận thông báo khi có cập nhật quan trọng.

**Mục tiêu sử dụng:**

- Hỗ trợ doanh nghiệp đăng tin tuyển dụng đúng quy trình, tiếp cận ứng viên phù hợp và quản lý tiến trình tuyển dụng rõ ràng.

### 2.1.2.4. Quản trị viên

**Yêu cầu:**

- Theo dõi dashboard tổng quan về người dùng, công ty, tin tuyển dụng và hồ sơ ứng tuyển.
- Quản lý tài khoản người dùng, khóa/mở tài khoản khi cần thiết.
- Duyệt hồ sơ công ty mới, duyệt lại công ty sau khi cập nhật, từ chối hoặc khóa công ty vi phạm.
- Duyệt tin tuyển dụng mới, từ chối tin không hợp lệ và thông báo kết quả cho nhà tuyển dụng.
- Quản lý danh mục kỹ năng, quản lý đánh giá công ty, theo dõi cảnh báo quản trị.
- Nhận thông báo khi có công ty mới, tin tuyển dụng mới, review mới hoặc yêu cầu cần xử lý.
- Hỗ trợ trao đổi với nhà tuyển dụng thông qua chức năng chat.

**Mục tiêu sử dụng:**

- Đảm bảo dữ liệu hệ thống chính xác, tin tuyển dụng đáng tin cậy, công ty được xác thực và quy trình tuyển dụng vận hành đúng nghiệp vụ.

## 2.2. Phân tích thiết kế hệ thống

## 2.2.1. Liệt kê Actor và Usecase

### Khách vãng lai

- Xem trang chủ.
- Tìm kiếm và lọc việc làm IT.
- Xem danh sách công ty.
- Xem chi tiết tin tuyển dụng.
- Đăng ký tài khoản.
- Đăng nhập hệ thống.
- Đặt lại mật khẩu.

### Ứng viên

- Quản lý hồ sơ năng lực và CV.
- Upload CV PDF.
- Lưu việc làm.
- Ứng tuyển vào tin tuyển dụng.
- Theo dõi trạng thái hồ sơ ứng tuyển.
- Xem và phản hồi lịch phỏng vấn.
- Chat với nhà tuyển dụng.
- Xem thông báo.
- Nhận gợi ý việc làm từ AI.

### Nhà tuyển dụng

- Cập nhật thông tin công ty.
- Tạo và gửi duyệt tin tuyển dụng.
- Sửa, tạm đóng, mở lại tin tuyển dụng.
- Xem danh sách ứng viên ứng tuyển.
- Xem CV/hồ sơ năng lực của ứng viên.
- Mời phỏng vấn.
- Cập nhật kết quả phỏng vấn.
- Chat với ứng viên và quản trị viên.
- Xem thông báo.

### Quản trị viên

- Theo dõi dashboard quản trị.
- Quản lý người dùng.
- Duyệt hồ sơ công ty.
- Duyệt tin tuyển dụng.
- Quản lý danh mục kỹ năng.
- Quản lý đánh giá công ty.
- Xử lý thông báo cần duyệt.
- Hỗ trợ chat.

## 2.2.2. Sơ đồ usecase

Sơ đồ usecase tổng quan mô tả mối quan hệ giữa bốn tác nhân chính của hệ thống EffortIT với các chức năng nghiệp vụ. Khách vãng lai có thể truy cập các chức năng công khai như tìm việc và xem công ty. Ứng viên kế thừa các chức năng công khai và được bổ sung các chức năng cá nhân như tạo CV, ứng tuyển, theo dõi lịch phỏng vấn và chat. Nhà tuyển dụng tập trung vào việc quản lý công ty, đăng tin và xử lý pipeline ứng viên. Quản trị viên có quyền quản lý, kiểm duyệt và giám sát toàn hệ thống.

Nguồn sơ đồ: `docs/so-do/01-usecase-tong-quan.puml`

**Hình 2.2: Sơ đồ usecase tổng quan hệ thống EffortIT**

## 2.2.3. Kịch bản và sơ đồ hoạt động

### 2.2.3.1. Scenario Use-case "Quên mật khẩu - Email Token"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Quên mật khẩu bằng Email Token |
| Description | Cho phép người dùng đặt lại mật khẩu khi quên thông tin đăng nhập. Hệ thống tạo token reset, gửi link qua email và cho phép nhập mật khẩu mới nếu token hợp lệ. |
| Actors | Khách vãng lai, Ứng viên, Nhà tuyển dụng, Quản trị viên |
| Input | Email đã đăng ký, token reset, mật khẩu mới |
| Output | Email reset được gửi, token được xác minh, mật khẩu mới được cập nhật |
| Basic flow | 1. Người dùng chọn quên mật khẩu. 2. Hệ thống hiển thị form nhập email. 3. Người dùng gửi email. 4. Backend kiểm tra email. 5. Nếu email tồn tại, hệ thống tạo token và gửi link reset. 6. Người dùng mở link reset. 7. Backend xác minh token. 8. Người dùng nhập mật khẩu mới. 9. Backend cập nhật mật khẩu và vô hiệu hóa token. 10. Hệ thống điều hướng về trang đăng nhập. |
| Alternative flow | Email không tồn tại thì hệ thống thông báo không tìm thấy tài khoản. Token hết hạn thì yêu cầu thực hiện lại quy trình quên mật khẩu. |
| Exception flow | Lỗi SMTP, lỗi kết nối API hoặc lỗi cập nhật database thì hệ thống thông báo thất bại và cho phép thử lại. |

Sơ đồ hoạt động mô tả đầy đủ các nhánh xử lý từ lúc người dùng nhập email, hệ thống tạo token, gửi email, xác minh token đến khi cập nhật mật khẩu mới.

Nguồn sơ đồ: `docs/so-do/02-activity-quen-mat-khau.puml`

**Hình 2.3: Sơ đồ hoạt động chức năng quên mật khẩu**

### 2.2.3.2. Scenario Use-case "Đăng nhập - JWT/Google"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Đăng nhập hệ thống |
| Description | Cho phép người dùng đăng nhập bằng email/mật khẩu hoặc Google. Sau khi xác thực thành công, backend cấp access token, refresh token và thông tin vai trò. |
| Actors | Ứng viên, Nhà tuyển dụng, Quản trị viên |
| Input | Email, mật khẩu hoặc Google credential |
| Output | Access token, refresh token, thông tin người dùng, đường dẫn dashboard theo vai trò |
| Basic flow | 1. Người dùng mở trang đăng nhập. 2. Nhập thông tin hoặc chọn Google Login. 3. Frontend gửi request đến API xác thực. 4. Backend kiểm tra thông tin đăng nhập. 5. Nếu hợp lệ, backend tạo token. 6. Frontend lưu phiên đăng nhập. 7. Hệ thống điều hướng đến dashboard ứng với vai trò. |
| Alternative flow | Sai email/mật khẩu hoặc Google token không hợp lệ thì hiển thị thông báo lỗi. |
| Exception flow | Lỗi server hoặc cấu hình Google Client ID thiếu thì hiển thị thông báo không thể đăng nhập. |

Nguồn sơ đồ: `docs/so-do/08-sequence-dang-nhap.puml`

**Hình 2.4: Sơ đồ tuần tự chức năng đăng nhập**

### 2.2.3.3. Scenario Use-case "Ứng viên ứng tuyển"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Ứng tuyển vào tin tuyển dụng |
| Description | Ứng viên chọn tin tuyển dụng đang mở, chọn CV chính hoặc CV đã upload và gửi hồ sơ ứng tuyển đến nhà tuyển dụng. |
| Actors | Ứng viên, Nhà tuyển dụng |
| Input | Mã tin tuyển dụng, mã hồ sơ năng lực, thông tin ứng viên |
| Output | Hồ sơ ứng tuyển được tạo, lịch sử trạng thái được ghi, nhà tuyển dụng nhận thông báo |
| Basic flow | 1. Ứng viên xem chi tiết tin tuyển dụng. 2. Chọn ứng tuyển. 3. Hệ thống kiểm tra đăng nhập và CV. 4. Ứng viên chọn CV. 5. Frontend gửi request tạo hồ sơ ứng tuyển. 6. Backend kiểm tra tin đang mở và chưa ứng tuyển trùng. 7. Backend tạo hồ sơ ứng tuyển. 8. Hệ thống ghi lịch sử và gửi thông báo cho nhà tuyển dụng. |
| Alternative flow | Chưa có CV thì hệ thống yêu cầu tạo hoặc upload CV. Đã ứng tuyển trước đó thì hệ thống thông báo không nộp trùng. |
| Exception flow | Tin đã đóng, user không phải ứng viên hoặc lỗi database thì hệ thống thông báo thất bại. |

Nguồn sơ đồ: `docs/so-do/03-activity-ung-tuyen.puml`

**Hình 2.5: Sơ đồ hoạt động chức năng ứng tuyển**

### 2.2.3.4. Scenario Use-case "Nhà tuyển dụng đăng tin và admin duyệt tin"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Tạo tin tuyển dụng và gửi duyệt |
| Description | Nhà tuyển dụng chỉ được tạo tin khi công ty đã được quản trị viên duyệt. Tin mới được tạo ở trạng thái chờ duyệt và chỉ hiển thị công khai sau khi admin chấp thuận. |
| Actors | Nhà tuyển dụng, Quản trị viên |
| Input | Thông tin tin tuyển dụng, kỹ năng, mức lương, hạn nộp, ảnh đại diện |
| Output | Tin tuyển dụng chờ duyệt, thông báo admin, kết quả duyệt cho nhà tuyển dụng |
| Basic flow | 1. Nhà tuyển dụng mở form tạo tin. 2. Hệ thống kiểm tra công ty đã duyệt. 3. Nhà tuyển dụng nhập thông tin và gửi. 4. Backend tạo tin trạng thái chờ duyệt. 5. Admin nhận thông báo. 6. Admin xem chi tiết và duyệt hoặc từ chối. 7. Backend cập nhật trạng thái và gửi thông báo kết quả cho nhà tuyển dụng. |
| Alternative flow | Công ty chưa duyệt thì hệ thống chặn tạo tin và hiển thị hướng dẫn hoàn thiện hồ sơ công ty. |
| Exception flow | Thiếu trường bắt buộc, ảnh upload lỗi hoặc lỗi server thì hệ thống thông báo thất bại. |

Nguồn sơ đồ: `docs/so-do/04-activity-dang-tin-duyet-tin.puml`

**Hình 2.6: Sơ đồ hoạt động tạo và duyệt tin tuyển dụng**

### 2.2.3.5. Scenario Use-case "Lịch phỏng vấn và kết quả phỏng vấn"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Mời phỏng vấn và cập nhật kết quả |
| Description | Nhà tuyển dụng mời ứng viên phỏng vấn, ứng viên xác nhận hoặc yêu cầu đổi lịch, sau đó nhà tuyển dụng cập nhật kết quả đạt/không đạt. |
| Actors | Ứng viên, Nhà tuyển dụng |
| Input | Hồ sơ ứng tuyển, thời gian phỏng vấn, hình thức, địa chỉ/link họp, ghi chú kết quả |
| Output | Lịch phỏng vấn, thông báo ứng viên, trạng thái hồ sơ ứng tuyển được cập nhật |
| Basic flow | 1. Nhà tuyển dụng chọn hồ sơ ứng viên. 2. Tạo lịch phỏng vấn. 3. Backend lưu lịch và gửi thông báo cho ứng viên. 4. Ứng viên xác nhận hoặc yêu cầu đổi lịch. 5. Nhà tuyển dụng cập nhật lịch nếu cần. 6. Sau phỏng vấn, nhà tuyển dụng nhập kết quả. 7. Backend cập nhật lịch, hồ sơ ứng tuyển và thông báo cho ứng viên. |
| Alternative flow | Ứng viên yêu cầu đổi lịch thì lịch chuyển sang trạng thái cần xử lý lại. |
| Exception flow | Hồ sơ không hợp lệ, lịch đã hủy hoặc không có quyền thao tác thì hệ thống từ chối request. |

Nguồn sơ đồ: `docs/so-do/13-activity-lich-phong-van.puml`

**Hình 2.7: Sơ đồ hoạt động lịch phỏng vấn và kết quả phỏng vấn**

### 2.2.3.6. Scenario Use-case "Chat realtime"

| Tiêu đề | Nội dung |
|---|---|
| Use case name | Chat giữa ứng viên, nhà tuyển dụng và quản trị viên |
| Description | Hệ thống cho phép trao đổi tin nhắn realtime. Ứng viên và nhà tuyển dụng chỉ chat theo ngữ cảnh hồ sơ ứng tuyển hợp lệ; nhà tuyển dụng có thể chat hỗ trợ với admin khi công ty đã được duyệt. |
| Actors | Ứng viên, Nhà tuyển dụng, Quản trị viên |
| Input | Mã người nhận, loại cuộc trò chuyện, mã hồ sơ ứng tuyển hoặc mã tin tuyển dụng |
| Output | Cuộc trò chuyện, tin nhắn realtime, thông báo tin nhắn mới |
| Basic flow | 1. Người dùng mở màn hình chat. 2. Frontend tải danh sách cuộc trò chuyện. 3. Người dùng chọn hoặc tạo cuộc trò chuyện. 4. Backend kiểm tra quyền. 5. Tin nhắn được lưu vào database. 6. Socket.IO phát sự kiện đến người nhận. 7. Frontend cập nhật hội thoại realtime. |
| Alternative flow | Nếu chưa đủ điều kiện chat, hệ thống vô hiệu hóa nút chat. |
| Exception flow | Mất kết nối socket hoặc request không hợp lệ thì hệ thống thông báo lỗi và có thể tải lại danh sách tin nhắn. |

Nguồn sơ đồ: `docs/so-do/11-sequence-chat-realtime.puml`

**Hình 2.8: Sơ đồ tuần tự chat realtime**

## 2.2.4. Sơ đồ Robustness

Sơ đồ robustness được sử dụng để mô tả mối quan hệ giữa tác nhân, giao diện biên, bộ điều khiển nghiệp vụ và thực thể dữ liệu. Trong EffortIT, các sơ đồ robustness tập trung vào những luồng có nhiều ràng buộc nghiệp vụ và cần kiểm tra quyền hạn.

Nguồn sơ đồ:

- `docs/so-do/05-robustness-quen-mat-khau.puml`
- `docs/so-do/06-robustness-ung-tuyen.puml`
- `docs/so-do/07-robustness-duyet-tin.puml`

**Hình 2.9: Sơ đồ robustness chức năng quên mật khẩu**

**Hình 2.10: Sơ đồ robustness chức năng ứng tuyển**

**Hình 2.11: Sơ đồ robustness chức năng duyệt tin tuyển dụng**

## 2.2.5. Thiết kế ERD

Cơ sở dữ liệu của EffortIT được thiết kế theo hướng tài liệu MongoDB/Mongoose, trong đó các thực thể được liên kết bằng mã định danh ObjectId. Các thực thể trung tâm gồm người dùng, ứng viên, nhà tuyển dụng, tin tuyển dụng, hồ sơ năng lực, hồ sơ ứng tuyển, lịch phỏng vấn, thông báo và tin nhắn.

### Các thực thể chính

- **NguoiDung**: lưu thông tin đăng nhập, vai trò, trạng thái tài khoản, token đặt lại mật khẩu.
- **UngVien**: mở rộng thông tin cho tài khoản ứng viên.
- **NhaTuyenDung**: lưu thông tin công ty, trạng thái duyệt và người phụ trách.
- **TinTuyenDung**: lưu nội dung tin tuyển dụng, kỹ năng, mức lương, trạng thái duyệt/đang mở.
- **HoSoNangLuc**: lưu CV builder, CV PDF upload, kỹ năng, học vấn, kinh nghiệm và dự án.
- **HoSoUngTuyen**: liên kết ứng viên, CV và tin tuyển dụng; lưu trạng thái pipeline.
- **LichPhongVan**: lưu lịch mời phỏng vấn, hình thức, thời gian, kết quả.
- **LichSuHoSoUngTuyen**: ghi lại lịch sử thay đổi trạng thái hồ sơ ứng tuyển.
- **ThongBao**: lưu thông báo theo người nhận, loại thông báo và trạng thái đã đọc.
- **CuocTroChuyen/TinNhan**: lưu kênh chat và nội dung tin nhắn realtime.
- **DanhMucKyNang**: lưu kỹ năng dùng cho tin tuyển dụng và lọc tìm kiếm.
- **DanhGiaCongTy**: lưu review công ty và trạng thái kiểm duyệt.
- **ViecLamDaLuu**: lưu quan hệ ứng viên lưu tin tuyển dụng.

Nguồn sơ đồ: `docs/so-do/12-erd-effortit.puml`

**Hình 2.12: Sơ đồ ERD hệ thống EffortIT**

## 2.2.6. Sơ đồ tuần tự

Sơ đồ tuần tự mô tả trình tự thời gian khi các thành phần trong hệ thống trao đổi thông điệp với nhau. Đối với EffortIT, các lifeline chính gồm người dùng, React Page, API Controller, Service Layer, Mongoose Model, MongoDB, Email Service, Socket.IO và Gemini AI.

Nguồn sơ đồ:

- `docs/so-do/08-sequence-dang-nhap.puml`
- `docs/so-do/09-sequence-quen-mat-khau.puml`
- `docs/so-do/10-sequence-ung-tuyen.puml`
- `docs/so-do/11-sequence-chat-realtime.puml`

**Hình 2.13: Sơ đồ tuần tự đăng nhập**

**Hình 2.14: Sơ đồ tuần tự quên mật khẩu**

**Hình 2.15: Sơ đồ tuần tự ứng tuyển**

**Hình 2.16: Sơ đồ tuần tự chat realtime**

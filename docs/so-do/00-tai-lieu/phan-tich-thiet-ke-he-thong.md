# Phân Tích Thiết Kế Hệ Thống EffortIT

## 1. Giới Thiệu

EffortIT là hệ thống tuyển dụng IT tập trung cho thị trường Đà Nẵng. Hệ thống hỗ trợ khách vãng lai tìm kiếm việc làm và công ty, ứng viên quản lý CV và ứng tuyển, nhà tuyển dụng quản lý hồ sơ công ty và tin tuyển dụng, quản trị viên duyệt dữ liệu, đồng thời tích hợp chat realtime, thông báo và trợ lý AI Gemini.

## 2. Tác Nhân

| Actor | Vai trò |
|---|---|
| Khách vãng lai | Xem trang chủ, tìm việc làm, xem công ty, đăng ký hoặc đăng nhập. |
| Ứng viên | Tạo CV/hồ sơ năng lực, lưu việc, ứng tuyển, nhận lịch phỏng vấn, chat và nhận thông báo. |
| Nhà tuyển dụng | Cập nhật hồ sơ công ty, đăng tin, quản lý ứng viên, mời phỏng vấn, chat và nhận thông báo duyệt. |
| Quản trị viên | Quản lý người dùng, duyệt công ty, duyệt tin tuyển dụng, duyệt đánh giá và theo dõi thông báo cần xử lý. |
| Gemini API | Phân tích câu hỏi, hỗ trợ gợi ý việc làm, CV và phỏng vấn; fallback bằng dữ liệu nội bộ khi cần. |
| Hệ thống Email SMTP | Gửi email đặt lại mật khẩu và email/thông báo nghiệp vụ. |
| MongoDB | Lưu trữ người dùng, CV, công ty, tin tuyển dụng, ứng tuyển, lịch phỏng vấn, chat và thông báo. |
| Socket.IO | Truyền tin nhắn và sự kiện realtime giữa các vai trò. |

## 3. Nhóm Use-Case

### 3.1 Khách Vãng Lai

- Xem trang chủ.
- Tìm kiếm và lọc việc làm.
- Xem chi tiết việc làm.
- Xem danh sách và hồ sơ công ty.
- Đăng ký tài khoản ứng viên.
- Đăng ký tài khoản nhà tuyển dụng.
- Đăng nhập bằng email/mật khẩu hoặc Google.
- Quên mật khẩu.
- Hỏi trợ lý AI trong phạm vi tuyển dụng IT.

### 3.2 Ứng Viên

- Quản lý hồ sơ cá nhân và CV.
- Upload CV PDF và trích xuất nội dung.
- Lưu việc làm.
- Ứng tuyển bằng hồ sơ năng lực.
- Theo dõi trạng thái hồ sơ ứng tuyển.
- Phản hồi lịch phỏng vấn.
- Chat với nhà tuyển dụng khi hồ sơ ở trạng thái phù hợp.
- Nhận và lọc thông báo.

### 3.3 Nhà Tuyển Dụng

- Cập nhật hồ sơ công ty.
- Chờ quản trị viên duyệt công ty.
- Đăng tin tuyển dụng khi công ty đã được duyệt.
- Theo dõi trạng thái duyệt tin.
- Quản lý hồ sơ ứng viên.
- Mời phỏng vấn và cập nhật kết quả phỏng vấn.
- Chat với ứng viên theo ngữ cảnh hồ sơ ứng tuyển.
- Nhận thông báo duyệt/từ chối.

### 3.4 Quản Trị Viên

- Quản lý tài khoản người dùng.
- Duyệt công ty.
- Duyệt tin tuyển dụng.
- Duyệt đánh giá công ty.
- Quản lý kỹ năng/danh mục.
- Nhận thông báo các mục cần duyệt.
- Theo dõi chat và dữ liệu hệ thống.

## 4. Mô Tả Sơ Đồ Use-Case Tổng Quan

Hình 1.1 mô tả ranh giới hệ thống EffortIT và các nhóm chức năng chính. Khách vãng lai có thể xem dữ liệu công khai và tạo tài khoản. Sau đăng nhập, ứng viên thao tác với CV và hồ sơ ứng tuyển; nhà tuyển dụng thao tác với công ty, tin tuyển dụng và ứng viên; quản trị viên duyệt các dữ liệu nhạy cảm trước khi công khai. Các dịch vụ ngoài như Gemini API, SMTP và Socket.IO được biểu diễn như tác nhân hỗ trợ.

## 5. Scenario Use-Case Chính

### 5.1 Đăng Ký Ứng Viên

| Mục | Nội dung |
|---|---|
| Use case name | Đăng ký ứng viên |
| Description | Người dùng tạo tài khoản ứng viên bằng thông tin tối thiểu. |
| Actors | Khách vãng lai, MongoDB |
| Input | Họ tên, email, số điện thoại, mật khẩu, xác nhận mật khẩu. |
| Output | Tài khoản ứng viên và hồ sơ ứng viên trống được tạo. |
| Basic flow | 1. Người dùng mở form đăng ký. <br> 2. Chọn vai trò ứng viên. <br> 3. Nhập thông tin bắt buộc. <br> 4. Hệ thống kiểm tra email, mật khẩu và số điện thoại. <br> 5. Hệ thống hash mật khẩu, tạo `NguoiDung` và `UngVien`. <br> 6. Người dùng được chuyển đến đăng nhập hoặc dashboard. |
| Alternative flow | Nếu email đã tồn tại, hệ thống gợi ý đăng nhập hoặc quên mật khẩu. |
| Exception flow | Nếu database lỗi, hệ thống trả thông báo tạo tài khoản thất bại và ghi log. |

### 5.2 Đăng Ký Nhà Tuyển Dụng

| Mục | Nội dung |
|---|---|
| Use case name | Đăng ký nhà tuyển dụng |
| Description | Người phụ trách tạo tài khoản nhà tuyển dụng và công ty ở trạng thái chờ duyệt. |
| Actors | Khách vãng lai, MongoDB, Quản trị viên |
| Input | Họ tên người phụ trách, email, số điện thoại, mật khẩu, tên công ty. |
| Output | Tài khoản nhà tuyển dụng và hồ sơ công ty `cho_duyet`. |
| Basic flow | 1. Người dùng chọn vai trò nhà tuyển dụng. <br> 2. Nhập thông tin tối thiểu. <br> 3. Hệ thống kiểm tra dữ liệu và email trùng. <br> 4. Tạo `NguoiDung` và `NhaTuyenDung`. <br> 5. Gửi thông báo cho quản trị viên về công ty cần duyệt. |
| Alternative flow | Nếu thiếu tên công ty, hệ thống yêu cầu bổ sung trước khi gửi. |
| Exception flow | Nếu lỗi lưu công ty, hệ thống rollback hoặc thông báo đăng ký chưa hoàn tất. |

### 5.3 Đăng Nhập JWT

| Mục | Nội dung |
|---|---|
| Use case name | Đăng nhập JWT |
| Description | Người dùng đăng nhập bằng email và mật khẩu để nhận access token và refresh token. |
| Actors | Ứng viên, Nhà tuyển dụng, Quản trị viên, MongoDB |
| Input | Email, mật khẩu. |
| Output | JWT, refresh token, thông tin người dùng và vai trò. |
| Basic flow | 1. Người dùng nhập email/mật khẩu. <br> 2. Backend tìm người dùng theo email. <br> 3. So sánh mật khẩu với hash. <br> 4. Kiểm tra trạng thái tài khoản. <br> 5. Phát token và trả dữ liệu hồ sơ tương ứng vai trò. |
| Alternative flow | Nếu người dùng là nhà tuyển dụng chưa duyệt, vẫn đăng nhập nhưng bị hạn chế đăng tin. |
| Exception flow | Sai mật khẩu, tài khoản bị khóa hoặc token không tạo được. |

### 5.4 Google Login

| Mục | Nội dung |
|---|---|
| Use case name | Google Login |
| Description | Người dùng đăng nhập bằng Google OAuth/Google Identity. |
| Actors | Khách vãng lai, Google, MongoDB |
| Input | Google credential token hoặc callback code. |
| Output | Tài khoản liên kết Google và JWT của hệ thống. |
| Basic flow | 1. Người dùng bấm đăng nhập Google. <br> 2. Frontend nhận credential từ Google. <br> 3. Backend xác thực `GOOGLE_CLIENT_ID`. <br> 4. Tìm hoặc tạo `NguoiDung`. <br> 5. Trả JWT và thông tin vai trò. |
| Alternative flow | Nếu tài khoản chưa có vai trò đầy đủ, hệ thống yêu cầu hoàn thiện thông tin. |
| Exception flow | Client ID sai, token hết hạn hoặc Google không phản hồi. |

### 5.5 Quên Mật Khẩu Bằng Email Token

| Mục | Nội dung |
|---|---|
| Use case name | Quên mật khẩu |
| Description | Người dùng yêu cầu link đặt lại mật khẩu qua email. |
| Actors | Khách vãng lai, Hệ thống Email SMTP, MongoDB |
| Input | Email tài khoản, mật khẩu mới, token reset. |
| Output | Email reset và mật khẩu mới được cập nhật. |
| Basic flow | 1. Người dùng nhập email. <br> 2. Hệ thống kiểm tra email. <br> 3. Tạo token ngẫu nhiên, lưu hash và hạn dùng 30 phút. <br> 4. Gửi email chứa link đặt lại mật khẩu. <br> 5. Người dùng mở link, nhập mật khẩu mới. <br> 6. Hệ thống kiểm tra token, cập nhật mật khẩu và xóa token. |
| Alternative flow | Nếu email không tồn tại, hệ thống trả thông báo trung tính để tránh lộ tài khoản. |
| Exception flow | Token hết hạn, token đã dùng, SMTP lỗi hoặc mật khẩu mới không hợp lệ. |

### 5.6 Tìm Kiếm Và Lọc Việc Làm

| Mục | Nội dung |
|---|---|
| Use case name | Tìm kiếm/lọc việc làm |
| Description | Người dùng tìm việc theo từ khóa, kỹ năng, cấp bậc, hình thức, mức lương và sắp xếp. |
| Actors | Khách vãng lai, Ứng viên, MongoDB |
| Input | Từ khóa, bộ lọc, trang, số lượng mỗi trang. |
| Output | Danh sách tin tuyển dụng đang mở và đã duyệt. |
| Basic flow | 1. Người dùng nhập từ khóa hoặc chọn bộ lọc. <br> 2. Frontend gửi query. <br> 3. Backend lọc tin theo trạng thái hợp lệ. <br> 4. Trả danh sách, tổng số bản ghi và phân trang. <br> 5. Frontend hiển thị card việc làm. |
| Alternative flow | Nếu không có kết quả, hệ thống gợi ý bỏ lọc hoặc hỏi AI. |
| Exception flow | Query không hợp lệ hoặc backend lỗi trả danh sách rỗng kèm thông báo. |

### 5.7 Quản Lý CV/Hồ Sơ Năng Lực

| Mục | Nội dung |
|---|---|
| Use case name | Quản lý CV/hồ sơ năng lực |
| Description | Ứng viên tạo, chỉnh sửa, upload và đặt CV chính. |
| Actors | Ứng viên, MongoDB, AI/CV Parser |
| Input | File CV, thông tin cá nhân, kỹ năng, kinh nghiệm, dự án. |
| Output | Hồ sơ năng lực có thể dùng để ứng tuyển. |
| Basic flow | 1. Ứng viên mở trang hồ sơ. <br> 2. Upload CV hoặc nhập thủ công. <br> 3. Hệ thống lưu file/text CV. <br> 4. Ứng viên bổ sung kỹ năng, kinh nghiệm, dự án. <br> 5. Đặt CV chính và trạng thái công khai nếu cần. |
| Alternative flow | Nếu upload CV thành công, hệ thống có thể trích xuất nội dung để điền gợi ý. |
| Exception flow | File quá lớn, sai định dạng hoặc lỗi lưu file. |

### 5.8 Ứng Tuyển

| Mục | Nội dung |
|---|---|
| Use case name | Ứng tuyển |
| Description | Ứng viên nộp hồ sơ vào một tin tuyển dụng đang mở. |
| Actors | Ứng viên, Nhà tuyển dụng, MongoDB, Hệ thống thông báo |
| Input | Mã tin tuyển dụng, mã hồ sơ năng lực, ghi chú ứng tuyển. |
| Output | Hồ sơ ứng tuyển ở trạng thái mới nộp/chờ xét duyệt. |
| Basic flow | 1. Ứng viên mở chi tiết việc làm. <br> 2. Bấm ứng tuyển. <br> 3. Chọn CV/hồ sơ năng lực. <br> 4. Hệ thống kiểm tra tin còn mở và chưa ứng tuyển trùng. <br> 5. Tạo `HoSoUngTuyen` và lịch sử trạng thái. <br> 6. Gửi thông báo cho nhà tuyển dụng. |
| Alternative flow | Nếu chưa có CV, hệ thống chuyển sang trang tạo hồ sơ. |
| Exception flow | Tin đã đóng, đã ứng tuyển trước đó hoặc hồ sơ không hợp lệ. |

### 5.9 Cập Nhật Hồ Sơ Công Ty

| Mục | Nội dung |
|---|---|
| Use case name | Nhà tuyển dụng cập nhật hồ sơ công ty |
| Description | Nhà tuyển dụng bổ sung logo, website, ngành, quy mô, địa chỉ và mô tả công ty. |
| Actors | Nhà tuyển dụng, Quản trị viên, MongoDB |
| Input | Thông tin công ty và tài liệu/ảnh liên quan. |
| Output | Hồ sơ công ty được cập nhật và có thể chuyển về trạng thái chờ duyệt. |
| Basic flow | 1. Nhà tuyển dụng mở trang công ty. <br> 2. Cập nhật dữ liệu. <br> 3. Hệ thống validate. <br> 4. Lưu thay đổi. <br> 5. Nếu cần duyệt lại, tạo thông báo cho quản trị viên. |
| Alternative flow | Nếu công ty đã duyệt và chỉ đổi thông tin phụ, hệ thống có thể giữ trạng thái cũ theo chính sách. |
| Exception flow | Logo sai định dạng, dữ liệu thiếu hoặc lỗi lưu MongoDB. |

### 5.10 Đăng Tin Tuyển Dụng

| Mục | Nội dung |
|---|---|
| Use case name | Nhà tuyển dụng đăng tin tuyển dụng |
| Description | Nhà tuyển dụng đã được duyệt tạo tin mới và gửi quản trị viên kiểm duyệt. |
| Actors | Nhà tuyển dụng, Quản trị viên, MongoDB, Hệ thống thông báo |
| Input | Tiêu đề, mô tả, yêu cầu, quyền lợi, lương, hình thức, cấp bậc, kỹ năng, hạn nộp, ảnh đại diện. |
| Output | Tin tuyển dụng trạng thái chờ duyệt. |
| Basic flow | 1. Nhà tuyển dụng mở form đăng tin. <br> 2. Hệ thống kiểm tra công ty đã duyệt. <br> 3. Nhà tuyển dụng nhập dữ liệu. <br> 4. Backend validate và lưu tin. <br> 5. Tạo thông báo cho quản trị viên. |
| Alternative flow | Nếu tin lưu nháp, hệ thống chưa gửi duyệt. |
| Exception flow | Công ty chưa duyệt, thiếu trường bắt buộc hoặc ảnh upload lỗi. |

### 5.11 Quản Trị Viên Duyệt Công Ty

| Mục | Nội dung |
|---|---|
| Use case name | Duyệt công ty |
| Description | Quản trị viên xem hồ sơ công ty và quyết định duyệt hoặc từ chối. |
| Actors | Quản trị viên, Nhà tuyển dụng, MongoDB, Hệ thống thông báo |
| Input | Mã công ty, quyết định duyệt/từ chối, ghi chú. |
| Output | Trạng thái duyệt công ty và thông báo cho nhà tuyển dụng. |
| Basic flow | 1. Admin mở danh sách công ty chờ duyệt. <br> 2. Xem chi tiết hồ sơ. <br> 3. Chọn duyệt hoặc từ chối. <br> 4. Hệ thống cập nhật `trangThaiDuyet`. <br> 5. Gửi thông báo kết quả cho nhà tuyển dụng. |
| Alternative flow | Admin yêu cầu bổ sung thông tin thay vì từ chối hẳn. |
| Exception flow | Công ty không tồn tại hoặc trạng thái đã thay đổi bởi phiên khác. |

### 5.12 Quản Trị Viên Duyệt Tin Tuyển Dụng

| Mục | Nội dung |
|---|---|
| Use case name | Duyệt tin tuyển dụng |
| Description | Quản trị viên kiểm duyệt tin tuyển dụng trước khi công khai. |
| Actors | Quản trị viên, Nhà tuyển dụng, MongoDB, Hệ thống thông báo |
| Input | Mã tin, quyết định, ghi chú. |
| Output | Tin được công khai hoặc bị từ chối. |
| Basic flow | 1. Admin mở tin chờ duyệt. <br> 2. Kiểm tra nội dung, mức lương, kỹ năng, ảnh. <br> 3. Duyệt hoặc từ chối. <br> 4. Backend cập nhật trạng thái. <br> 5. Gửi thông báo cho nhà tuyển dụng. |
| Alternative flow | Admin chỉnh trạng thái cần bổ sung nếu chính sách yêu cầu. |
| Exception flow | Tin không thuộc công ty hợp lệ hoặc công ty chưa được duyệt. |

### 5.13 Mời Phỏng Vấn

| Mục | Nội dung |
|---|---|
| Use case name | Mời phỏng vấn |
| Description | Nhà tuyển dụng tạo lịch phỏng vấn cho hồ sơ ứng tuyển phù hợp. |
| Actors | Nhà tuyển dụng, Ứng viên, MongoDB, Hệ thống thông báo |
| Input | Hồ sơ ứng tuyển, thời gian, hình thức, địa chỉ/link họp, ghi chú. |
| Output | Lịch phỏng vấn và thông báo cho ứng viên. |
| Basic flow | 1. Nhà tuyển dụng chọn hồ sơ. <br> 2. Bấm mời phỏng vấn. <br> 3. Nhập thời gian và hình thức. <br> 4. Hệ thống tạo `LichPhongVan`. <br> 5. Cập nhật trạng thái hồ sơ và gửi thông báo. |
| Alternative flow | Ứng viên đề xuất đổi lịch nếu chưa phù hợp. |
| Exception flow | Thời gian kết thúc trước bắt đầu hoặc hồ sơ không còn hợp lệ. |

### 5.14 Cập Nhật Kết Quả Phỏng Vấn

| Mục | Nội dung |
|---|---|
| Use case name | Cập nhật kết quả phỏng vấn |
| Description | Nhà tuyển dụng nhập kết quả đạt/không đạt và ghi chú sau phỏng vấn. |
| Actors | Nhà tuyển dụng, Ứng viên, MongoDB, Hệ thống thông báo |
| Input | Mã lịch phỏng vấn, kết quả, ghi chú. |
| Output | Lịch phỏng vấn và hồ sơ ứng tuyển được cập nhật. |
| Basic flow | 1. Nhà tuyển dụng mở lịch phỏng vấn. <br> 2. Chọn cập nhật kết quả. <br> 3. Nhập kết quả và ghi chú. <br> 4. Backend cập nhật lịch, hồ sơ và lịch sử. <br> 5. Gửi thông báo cho ứng viên. |
| Alternative flow | Nếu chưa có kết quả cuối, lưu trạng thái cần bổ sung/đang xét. |
| Exception flow | Thiếu ghi chú bắt buộc hoặc lịch đã bị hủy. |

### 5.15 Chat Realtime

| Mục | Nội dung |
|---|---|
| Use case name | Chat realtime |
| Description | Ứng viên và nhà tuyển dụng trao đổi theo hồ sơ ứng tuyển; admin có thể nhận hỗ trợ theo nghiệp vụ. |
| Actors | Ứng viên, Nhà tuyển dụng, Quản trị viên, Socket.IO, MongoDB |
| Input | Nội dung tin nhắn, mã cuộc trò chuyện, file đính kèm nếu có. |
| Output | Tin nhắn lưu DB và được phát realtime cho thành viên. |
| Basic flow | 1. Người dùng mở chat. <br> 2. Backend kiểm tra quyền tham gia cuộc trò chuyện. <br> 3. Người dùng gửi tin nhắn. <br> 4. Tin nhắn được lưu MongoDB. <br> 5. Socket.IO phát sự kiện đến thành viên. <br> 6. Tạo thông báo nếu người nhận đang offline. |
| Alternative flow | Nếu chưa có cuộc trò chuyện hợp lệ, hệ thống tạo theo hồ sơ ứng tuyển được phép chat. |
| Exception flow | Người dùng không thuộc cuộc trò chuyện hoặc socket mất kết nối. |

### 5.16 Thông Báo Hệ Thống

| Mục | Nội dung |
|---|---|
| Use case name | Thông báo hệ thống |
| Description | Hệ thống tạo, lưu, lọc và đánh dấu đã đọc các thông báo nghiệp vụ. |
| Actors | Ứng viên, Nhà tuyển dụng, Quản trị viên, MongoDB |
| Input | Loại thông báo, người nhận, tiêu đề, nội dung, liên kết xử lý. |
| Output | Thông báo hiển thị trong dashboard đúng vai trò. |
| Basic flow | 1. Nghiệp vụ phát sinh sự kiện. <br> 2. Backend gọi helper tạo thông báo. <br> 3. Lưu `ThongBao`. <br> 4. Frontend lấy danh sách theo vai trò và bộ lọc. <br> 5. Người dùng mở hoặc đánh dấu đã đọc. |
| Alternative flow | Nếu có socket, thông báo mới được đẩy realtime. |
| Exception flow | Người nhận không tồn tại hoặc liên kết xử lý không hợp lệ. |

### 5.17 Hỏi AI Gemini Và Fallback Database

| Mục | Nội dung |
|---|---|
| Use case name | Hỏi AI Gemini và fallback database |
| Description | Người dùng hỏi trợ lý AI về tuyển dụng IT, CV, phỏng vấn hoặc gợi ý việc làm. |
| Actors | Khách vãng lai, Ứng viên, Gemini API, MongoDB |
| Input | Câu hỏi, ngữ cảnh người dùng nếu đã đăng nhập. |
| Output | Câu trả lời có kiểm soát phạm vi và danh sách gợi ý nếu có. |
| Basic flow | 1. Người dùng nhập câu hỏi. <br> 2. Backend kiểm tra phạm vi IT/tuyển dụng. <br> 3. Nếu phù hợp, gọi Gemini API kèm prompt an toàn. <br> 4. Nếu cần dữ liệu việc làm, truy vấn MongoDB. <br> 5. Trả câu trả lời và gợi ý liên quan. |
| Alternative flow | Nếu Gemini chậm/lỗi, hệ thống fallback bằng dữ liệu việc làm trong database. |
| Exception flow | Câu hỏi ngoài phạm vi được trả lời lịch sự rằng trợ lý chỉ hỗ trợ tuyển dụng IT. |

## 6. Liên Kết Sơ Đồ Với Scenario

| Nhóm | Sơ đồ đại diện | Nội dung kiểm chứng |
|---|---|---|
| Use-case | Hình 1.1 đến 1.6 | Actor và phạm vi hệ thống. |
| Activity | Hình 2.1 đến 2.18 | Basic flow và nhánh thay thế của từng nghiệp vụ. |
| Sequence | Hình 3.1 đến 3.12 | Tương tác frontend, backend, MongoDB, SMTP, Socket.IO, Gemini API. |
| Robustness | Hình 4.1 đến 4.7 | Boundary, Control, Entity của use-case trọng tâm. |
| ERD | Hình 5.1 đến 5.5 | Entity, khóa chính, khóa ngoại và quan hệ dữ liệu. |
| Class/Component | Hình 6.1 đến 6.6 | Module xử lý, service, repository và component triển khai. |
| Deployment | Hình 7.1 đến 7.2 | Cấu hình VPS, Nginx, PM2, MongoDB, webhook deploy. |

## 7. Ghi Chú Học Thuật

Các sơ đồ được tách theo mức trừu tượng. Use-case mô tả yêu cầu chức năng từ góc nhìn tác nhân. Activity mô tả luồng xử lý nghiệp vụ. Sequence mô tả thứ tự gọi giữa các thành phần. Robustness nối use-case với thiết kế lớp theo ba nhóm boundary, control và entity. ERD mô tả cấu trúc dữ liệu. Class/component và deployment mô tả kiến trúc triển khai của hệ thống.

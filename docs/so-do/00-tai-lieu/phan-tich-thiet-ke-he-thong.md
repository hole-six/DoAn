# Phân Tích Thiết Kế Hệ Thống EffortIT

## 1. Giới Thiệu

EffortIT là website tuyển dụng ngành công nghệ thông tin tại Thành phố Đà Nẵng. Hệ thống hỗ trợ khách vãng lai tìm kiếm việc làm, ứng viên quản lý hồ sơ năng lực và ứng tuyển, nhà tuyển dụng quản lý công ty/tin tuyển dụng/hồ sơ ứng viên, đồng thời cho phép quản trị viên kiểm duyệt dữ liệu quan trọng trước khi công khai.

## 2.2. Phân Tích Thiết Kế Hệ Thống

Phần này trình bày actor, usecase chính, kịch bản nghiệp vụ và mối liên hệ giữa các loại sơ đồ. Danh sách usecase dưới đây là nguồn chuẩn để xây dựng usecase diagram, activity diagram, robustness diagram, sequence diagram và ERD.

### 2.2.1. Liệt Kê Actor Và Usecase

#### 2.2.1.1. Khách vãng lai

- Tìm kiếm việc làm.
- Xem chi tiết tin tuyển dụng.
- Xem chi tiết công ty.
- Đăng ký tài khoản.
- Đăng nhập.
- Quên mật khẩu.

#### 2.2.1.2. Ứng viên

- Đăng nhập.
- Cập nhật thông tin tài khoản.
- Quản lý hồ sơ năng lực.
- Lưu việc làm.
- Ứng tuyển tin tuyển dụng.
- Theo dõi trạng thái ứng tuyển.
- Quản lý lịch phỏng vấn.
- Đánh giá công ty.

#### 2.2.1.3. Nhà tuyển dụng

- Đăng nhập.
- Cập nhật thông tin tài khoản.
- Cập nhật hồ sơ công ty.
- Đăng tin tuyển dụng.
- Quản lý tin tuyển dụng.
- Quản lý hồ sơ ứng viên.
- Mời ứng viên phỏng vấn.
- Cập nhật kết quả phỏng vấn.

#### 2.2.1.4. Quản trị viên

- Quản lý người dùng.
- Duyệt hồ sơ công ty.
- Duyệt tin tuyển dụng.
- Quản lý danh mục kỹ năng.
- Duyệt đánh giá công ty.
- Xem thống kê hệ thống.

### 2.2.2. Mô Tả Sơ Đồ Usecase Tổng Quan

Sơ đồ usecase tổng quan mô tả ranh giới hệ thống EffortIT và các chức năng nghiệp vụ chính theo từng actor. Khách vãng lai thao tác với dữ liệu công khai và xác thực tài khoản. Ứng viên quản lý hồ sơ năng lực, lưu việc, ứng tuyển, theo dõi tiến trình và đánh giá công ty. Nhà tuyển dụng quản lý hồ sơ công ty, tin tuyển dụng, hồ sơ ứng viên và lịch phỏng vấn. Quản trị viên chịu trách nhiệm kiểm duyệt, quản trị dữ liệu nền và theo dõi thống kê.

Các chức năng phụ như chat realtime, AI, deployment và component kỹ thuật không được đưa vào usecase lõi của báo cáo này để tránh làm loãng phạm vi phân tích nghiệp vụ.

### 2.2.3. Scenario Usecase Chính

#### Bảng 2.1: Scenario Usecase "Đăng ký tài khoản"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Đăng ký tài khoản |
| 2 | Description | Khách vãng lai tạo tài khoản ứng viên hoặc nhà tuyển dụng để sử dụng hệ thống. |
| 3 | Actors | Khách vãng lai. |
| 4 | Input | Họ tên, email, số điện thoại, mật khẩu, vai trò; nhà tuyển dụng nhập thêm tên công ty. |
| 5 | Output | Tài khoản được tạo; ứng viên có hồ sơ ban đầu, nhà tuyển dụng có hồ sơ công ty chờ duyệt. |
| 6 | Basic flow | 1. Actor mở giao diện đăng ký. <br> 2. Actor chọn vai trò. <br> 3. Actor nhập thông tin bắt buộc. <br> 4. Hệ thống kiểm tra dữ liệu. <br> 5. Hệ thống tạo tài khoản và hồ sơ tương ứng. <br> 6. Hệ thống thông báo đăng ký thành công. |
| 7 | Alternative flow | Nếu actor chọn nhà tuyển dụng, hệ thống tạo hồ sơ công ty ở trạng thái chờ duyệt. |
| 8 | Exception flow | Email đã tồn tại, thiếu thông tin hoặc mật khẩu không hợp lệ thì hệ thống thông báo lỗi. |

#### Bảng 2.2: Scenario Usecase "Đăng nhập"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Đăng nhập |
| 2 | Description | Người dùng đã có tài khoản đăng nhập để truy cập chức năng theo vai trò. |
| 3 | Actors | Khách vãng lai, ứng viên, nhà tuyển dụng, quản trị viên. |
| 4 | Input | Email và mật khẩu. |
| 5 | Output | Phiên đăng nhập và giao diện phù hợp với vai trò. |
| 6 | Basic flow | 1. Actor mở trang đăng nhập. <br> 2. Actor nhập email, mật khẩu. <br> 3. Hệ thống kiểm tra tài khoản. <br> 4. Hệ thống xác định vai trò. <br> 5. Hệ thống chuyển actor đến giao diện tương ứng. |
| 7 | Alternative flow | Actor có thể quay lại trang chủ hoặc chuyển sang quên mật khẩu. |
| 8 | Exception flow | Sai thông tin, tài khoản bị khóa hoặc không hoạt động thì hệ thống từ chối đăng nhập. |

#### Bảng 2.3: Scenario Usecase "Quên mật khẩu"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quên mật khẩu |
| 2 | Description | Người dùng yêu cầu liên kết đặt lại mật khẩu qua email. |
| 3 | Actors | Khách vãng lai, ứng viên, nhà tuyển dụng, quản trị viên. |
| 4 | Input | Email tài khoản, mã đặt lại mật khẩu, mật khẩu mới. |
| 5 | Output | Email đặt lại mật khẩu được gửi và mật khẩu mới được cập nhật nếu mã hợp lệ. |
| 6 | Basic flow | 1. Actor nhập email. <br> 2. Hệ thống tạo mã đặt lại mật khẩu. <br> 3. Hệ thống gửi email reset. <br> 4. Actor mở liên kết và nhập mật khẩu mới. <br> 5. Hệ thống kiểm tra mã. <br> 6. Hệ thống cập nhật mật khẩu. |
| 7 | Alternative flow | Nếu email không tồn tại, hệ thống trả thông báo trung tính để tránh lộ tài khoản. |
| 8 | Exception flow | Mã hết hạn, sai mã hoặc mật khẩu mới không hợp lệ thì hệ thống từ chối cập nhật. |

#### Bảng 2.4: Scenario Usecase "Tìm kiếm việc làm"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Tìm kiếm việc làm |
| 2 | Description | Người dùng tìm các tin tuyển dụng IT đang công khai. |
| 3 | Actors | Khách vãng lai, ứng viên. |
| 4 | Input | Từ khóa, kỹ năng, cấp bậc, hình thức làm việc, mức lương. |
| 5 | Output | Danh sách tin tuyển dụng đã duyệt, còn mở và phù hợp điều kiện tìm kiếm. |
| 6 | Basic flow | 1. Actor mở trang việc làm. <br> 2. Actor nhập từ khóa hoặc bộ lọc. <br> 3. Hệ thống lọc tin hợp lệ. <br> 4. Hệ thống phân trang kết quả. <br> 5. Actor xem danh sách việc làm. |
| 7 | Alternative flow | Actor thay đổi bộ lọc để hệ thống cập nhật kết quả. |
| 8 | Exception flow | Không có kết quả hoặc lỗi tải dữ liệu thì hệ thống hiển thị thông báo phù hợp. |

#### Bảng 2.5: Scenario Usecase "Xem chi tiết tin tuyển dụng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Xem chi tiết tin tuyển dụng |
| 2 | Description | Người dùng xem đầy đủ thông tin của một tin tuyển dụng. |
| 3 | Actors | Khách vãng lai, ứng viên. |
| 4 | Input | Tin tuyển dụng được chọn. |
| 5 | Output | Mô tả công việc, yêu cầu, quyền lợi, mức lương, công ty và hạn nộp. |
| 6 | Basic flow | 1. Actor chọn tin tuyển dụng. <br> 2. Hệ thống kiểm tra tin có được công khai hay không. <br> 3. Hệ thống tải thông tin tin và công ty. <br> 4. Hệ thống hiển thị chi tiết. |
| 7 | Alternative flow | Nếu actor là ứng viên đã đăng nhập, hệ thống hiển thị thao tác lưu việc hoặc ứng tuyển. |
| 8 | Exception flow | Tin không tồn tại, chưa duyệt hoặc đã đóng thì hệ thống thông báo không khả dụng. |

#### Bảng 2.6: Scenario Usecase "Xem chi tiết công ty"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Xem chi tiết công ty |
| 2 | Description | Người dùng xem hồ sơ chi tiết của công ty tuyển dụng. |
| 3 | Actors | Khách vãng lai, ứng viên. |
| 4 | Input | Công ty được chọn. |
| 5 | Output | Thông tin công ty, mô tả, quy mô, địa chỉ, tin đang tuyển và đánh giá đã duyệt. |
| 6 | Basic flow | 1. Actor chọn công ty. <br> 2. Hệ thống kiểm tra công ty đã được duyệt. <br> 3. Hệ thống tải hồ sơ công ty, tin đang tuyển và đánh giá. <br> 4. Actor xem chi tiết công ty. |
| 7 | Alternative flow | Actor chọn một tin tuyển dụng của công ty để chuyển sang trang chi tiết tin. |
| 8 | Exception flow | Công ty không tồn tại hoặc chưa được duyệt thì hệ thống không hiển thị công khai. |

#### Bảng 2.7: Scenario Usecase "Cập nhật thông tin tài khoản"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Cập nhật thông tin tài khoản |
| 2 | Description | Người dùng đã đăng nhập cập nhật thông tin cá nhân cơ bản. |
| 3 | Actors | Ứng viên, nhà tuyển dụng. |
| 4 | Input | Họ tên, số điện thoại và thông tin liên hệ được phép chỉnh sửa. |
| 5 | Output | Thông tin tài khoản được cập nhật. |
| 6 | Basic flow | 1. Actor mở trang tài khoản. <br> 2. Actor chỉnh sửa thông tin. <br> 3. Hệ thống kiểm tra dữ liệu. <br> 4. Hệ thống lưu thay đổi. <br> 5. Hệ thống thông báo thành công. |
| 7 | Alternative flow | Actor hủy thao tác, hệ thống giữ nguyên dữ liệu cũ. |
| 8 | Exception flow | Dữ liệu không hợp lệ thì hệ thống thông báo lỗi. |

#### Bảng 2.8: Scenario Usecase "Quản lý hồ sơ năng lực"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý hồ sơ năng lực |
| 2 | Description | Ứng viên tạo, cập nhật, upload và quản lý hồ sơ năng lực/CV. |
| 3 | Actors | Ứng viên. |
| 4 | Input | Thông tin cá nhân, kỹ năng, kinh nghiệm, dự án, học vấn và file CV nếu có. |
| 5 | Output | Hồ sơ năng lực được lưu và có thể dùng để ứng tuyển. |
| 6 | Basic flow | 1. Ứng viên mở trang hồ sơ. <br> 2. Ứng viên nhập hoặc upload thông tin. <br> 3. Hệ thống kiểm tra dữ liệu/file. <br> 4. Hệ thống lưu hồ sơ. <br> 5. Hệ thống hiển thị bản xem trước. |
| 7 | Alternative flow | Ứng viên đặt một hồ sơ làm CV chính. |
| 8 | Exception flow | File sai định dạng, quá lớn hoặc dữ liệu thiếu thì hệ thống báo lỗi. |

#### Bảng 2.9: Scenario Usecase "Lưu việc làm"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Lưu việc làm |
| 2 | Description | Ứng viên lưu hoặc bỏ lưu một tin tuyển dụng quan tâm. |
| 3 | Actors | Ứng viên. |
| 4 | Input | Tin tuyển dụng được chọn. |
| 5 | Output | Tin được thêm vào hoặc xóa khỏi danh sách việc làm đã lưu. |
| 6 | Basic flow | 1. Ứng viên chọn tin tuyển dụng. <br> 2. Ứng viên bấm lưu việc. <br> 3. Hệ thống kiểm tra tin. <br> 4. Hệ thống lưu tin vào danh sách quan tâm. |
| 7 | Alternative flow | Nếu tin đã được lưu, thao tác tiếp theo sẽ bỏ lưu tin. |
| 8 | Exception flow | Tin không tồn tại hoặc không công khai thì hệ thống từ chối thao tác. |

#### Bảng 2.10: Scenario Usecase "Ứng tuyển tin tuyển dụng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Ứng tuyển tin tuyển dụng |
| 2 | Description | Ứng viên nộp hồ sơ năng lực vào một tin tuyển dụng đang mở. |
| 3 | Actors | Ứng viên, nhà tuyển dụng. |
| 4 | Input | Tin tuyển dụng, hồ sơ năng lực và thư xin việc nếu có. |
| 5 | Output | Hồ sơ ứng tuyển được tạo và gửi đến nhà tuyển dụng. |
| 6 | Basic flow | 1. Ứng viên mở chi tiết tin. <br> 2. Ứng viên chọn ứng tuyển. <br> 3. Hệ thống kiểm tra tin và hồ sơ năng lực. <br> 4. Ứng viên gửi hồ sơ. <br> 5. Hệ thống tạo hồ sơ ứng tuyển và lịch sử trạng thái. |
| 7 | Alternative flow | Nếu ứng viên chưa có hồ sơ năng lực, hệ thống yêu cầu tạo hồ sơ trước. |
| 8 | Exception flow | Tin đã đóng, chưa duyệt hoặc ứng viên đã ứng tuyển thì hệ thống từ chối. |

#### Bảng 2.11: Scenario Usecase "Theo dõi trạng thái ứng tuyển"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Theo dõi trạng thái ứng tuyển |
| 2 | Description | Ứng viên theo dõi tiến trình xử lý các hồ sơ đã nộp. |
| 3 | Actors | Ứng viên. |
| 4 | Input | Danh sách hồ sơ ứng tuyển của ứng viên. |
| 5 | Output | Trạng thái hiện tại và lịch sử xử lý hồ sơ. |
| 6 | Basic flow | 1. Ứng viên mở trang ứng tuyển. <br> 2. Hệ thống tải danh sách hồ sơ. <br> 3. Ứng viên chọn hồ sơ. <br> 4. Hệ thống hiển thị trạng thái và lịch sử xử lý. |
| 7 | Alternative flow | Ứng viên lọc hồ sơ theo trạng thái. |
| 8 | Exception flow | Chưa có hồ sơ ứng tuyển thì hệ thống hiển thị trạng thái trống. |

#### Bảng 2.12: Scenario Usecase "Quản lý lịch phỏng vấn"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý lịch phỏng vấn |
| 2 | Description | Ứng viên xem lịch phỏng vấn và phản hồi khi cần. |
| 3 | Actors | Ứng viên, nhà tuyển dụng. |
| 4 | Input | Lịch phỏng vấn liên quan đến hồ sơ ứng tuyển. |
| 5 | Output | Thông tin lịch, trạng thái xác nhận hoặc yêu cầu đổi lịch. |
| 6 | Basic flow | 1. Ứng viên mở trang lịch phỏng vấn. <br> 2. Hệ thống tải lịch liên quan. <br> 3. Ứng viên xem thời gian, hình thức và trạng thái. <br> 4. Ứng viên phản hồi nếu cần. |
| 7 | Alternative flow | Ứng viên chỉ xem lịch và không gửi phản hồi. |
| 8 | Exception flow | Không có lịch phỏng vấn thì hệ thống hiển thị trạng thái trống. |

#### Bảng 2.13: Scenario Usecase "Đánh giá công ty"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Đánh giá công ty |
| 2 | Description | Ứng viên gửi đánh giá về công ty để quản trị viên duyệt trước khi công khai. |
| 3 | Actors | Ứng viên, quản trị viên. |
| 4 | Input | Công ty, điểm đánh giá, nội dung nhận xét và tùy chọn ẩn danh. |
| 5 | Output | Đánh giá được lưu ở trạng thái chờ duyệt. |
| 6 | Basic flow | 1. Ứng viên mở chi tiết công ty. <br> 2. Ứng viên nhập điểm và nội dung đánh giá. <br> 3. Hệ thống kiểm tra điều kiện đánh giá. <br> 4. Hệ thống lưu đánh giá chờ duyệt. <br> 5. Hệ thống thông báo đánh giá đã được ghi nhận. |
| 7 | Alternative flow | Ứng viên chỉnh sửa nội dung trước khi gửi. |
| 8 | Exception flow | Công ty không công khai, nội dung không hợp lệ hoặc ứng viên không đủ điều kiện thì hệ thống từ chối. |

#### Bảng 2.14: Scenario Usecase "Cập nhật hồ sơ công ty"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Cập nhật hồ sơ công ty |
| 2 | Description | Nhà tuyển dụng cập nhật thông tin công ty để gửi quản trị viên duyệt. |
| 3 | Actors | Nhà tuyển dụng, quản trị viên. |
| 4 | Input | Tên công ty, logo, website, ngành nghề, quy mô, địa chỉ và mô tả. |
| 5 | Output | Hồ sơ công ty được lưu và chuyển trạng thái chờ duyệt nếu cần. |
| 6 | Basic flow | 1. Nhà tuyển dụng mở trang công ty. <br> 2. Nhà tuyển dụng nhập hoặc chỉnh sửa thông tin. <br> 3. Hệ thống kiểm tra dữ liệu. <br> 4. Hệ thống lưu hồ sơ. <br> 5. Hệ thống cập nhật trạng thái duyệt. |
| 7 | Alternative flow | Nhà tuyển dụng lưu tạm thông tin để hoàn thiện sau. |
| 8 | Exception flow | Thiếu dữ liệu bắt buộc hoặc dữ liệu không hợp lệ thì hệ thống yêu cầu bổ sung. |

#### Bảng 2.15: Scenario Usecase "Đăng tin tuyển dụng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Đăng tin tuyển dụng |
| 2 | Description | Nhà tuyển dụng đã được duyệt tạo tin mới và gửi quản trị viên kiểm duyệt. |
| 3 | Actors | Nhà tuyển dụng, quản trị viên. |
| 4 | Input | Tiêu đề, mô tả, yêu cầu, quyền lợi, lương, kỹ năng, hình thức, cấp bậc và hạn nộp. |
| 5 | Output | Tin tuyển dụng ở trạng thái chờ duyệt. |
| 6 | Basic flow | 1. Nhà tuyển dụng mở form đăng tin. <br> 2. Hệ thống kiểm tra công ty đã được duyệt. <br> 3. Nhà tuyển dụng nhập nội dung tin. <br> 4. Hệ thống kiểm tra dữ liệu. <br> 5. Hệ thống lưu tin chờ duyệt. |
| 7 | Alternative flow | Nhà tuyển dụng lưu nháp để hoàn thiện sau. |
| 8 | Exception flow | Công ty chưa được duyệt hoặc tin thiếu thông tin thì hệ thống không cho gửi duyệt. |

#### Bảng 2.16: Scenario Usecase "Quản lý tin tuyển dụng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý tin tuyển dụng |
| 2 | Description | Nhà tuyển dụng theo dõi, chỉnh sửa, đóng hoặc mở lại tin đã tạo. |
| 3 | Actors | Nhà tuyển dụng. |
| 4 | Input | Danh sách tin tuyển dụng thuộc công ty. |
| 5 | Output | Tin được cập nhật trạng thái hoặc nội dung. |
| 6 | Basic flow | 1. Nhà tuyển dụng mở trang quản lý tin. <br> 2. Hệ thống tải danh sách tin. <br> 3. Nhà tuyển dụng chọn tin cần xử lý. <br> 4. Hệ thống lưu thay đổi và cập nhật danh sách. |
| 7 | Alternative flow | Nhà tuyển dụng lọc tin theo trạng thái để quản lý dễ hơn. |
| 8 | Exception flow | Tin không thuộc công ty của nhà tuyển dụng thì hệ thống từ chối thao tác. |

#### Bảng 2.17: Scenario Usecase "Quản lý hồ sơ ứng viên"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý hồ sơ ứng viên |
| 2 | Description | Nhà tuyển dụng xem và xử lý hồ sơ ứng viên ứng tuyển vào tin của công ty. |
| 3 | Actors | Nhà tuyển dụng, ứng viên. |
| 4 | Input | Danh sách hồ sơ ứng tuyển, trạng thái xử lý và ghi chú. |
| 5 | Output | Hồ sơ ứng viên được cập nhật trạng thái trong quy trình tuyển dụng. |
| 6 | Basic flow | 1. Nhà tuyển dụng mở trang ứng viên. <br> 2. Hệ thống hiển thị danh sách hồ sơ. <br> 3. Nhà tuyển dụng xem chi tiết CV. <br> 4. Nhà tuyển dụng cập nhật trạng thái xử lý. <br> 5. Hệ thống ghi lịch sử thay đổi. |
| 7 | Alternative flow | Nhà tuyển dụng lọc hồ sơ theo tin tuyển dụng hoặc trạng thái. |
| 8 | Exception flow | Hồ sơ không thuộc tin của công ty thì hệ thống từ chối truy cập. |

#### Bảng 2.18: Scenario Usecase "Mời ứng viên phỏng vấn"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Mời ứng viên phỏng vấn |
| 2 | Description | Nhà tuyển dụng tạo lịch phỏng vấn cho ứng viên phù hợp. |
| 3 | Actors | Nhà tuyển dụng, ứng viên. |
| 4 | Input | Hồ sơ ứng tuyển, thời gian, hình thức, địa điểm hoặc link họp. |
| 5 | Output | Lịch phỏng vấn được tạo và gửi đến ứng viên. |
| 6 | Basic flow | 1. Nhà tuyển dụng chọn hồ sơ ứng viên. <br> 2. Nhà tuyển dụng nhập thông tin lịch. <br> 3. Hệ thống kiểm tra thời gian và trạng thái hồ sơ. <br> 4. Hệ thống tạo lịch phỏng vấn. <br> 5. Hệ thống cập nhật trạng thái hồ sơ. |
| 7 | Alternative flow | Nhà tuyển dụng chỉnh sửa lịch trước khi gửi. |
| 8 | Exception flow | Thời gian không hợp lệ hoặc hồ sơ không đủ điều kiện thì hệ thống không tạo lịch. |

#### Bảng 2.19: Scenario Usecase "Cập nhật kết quả phỏng vấn"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Cập nhật kết quả phỏng vấn |
| 2 | Description | Nhà tuyển dụng ghi nhận kết quả sau buổi phỏng vấn. |
| 3 | Actors | Nhà tuyển dụng, ứng viên. |
| 4 | Input | Lịch phỏng vấn, kết quả đạt/không đạt và ghi chú. |
| 5 | Output | Kết quả phỏng vấn và trạng thái hồ sơ ứng tuyển được cập nhật. |
| 6 | Basic flow | 1. Nhà tuyển dụng mở lịch phỏng vấn. <br> 2. Nhà tuyển dụng chọn lịch cần cập nhật. <br> 3. Nhà tuyển dụng nhập kết quả. <br> 4. Hệ thống kiểm tra dữ liệu. <br> 5. Hệ thống cập nhật lịch và hồ sơ ứng tuyển. |
| 7 | Alternative flow | Nếu chưa có kết quả cuối, nhà tuyển dụng giữ trạng thái đang xử lý. |
| 8 | Exception flow | Lịch đã hủy hoặc thiếu thông tin kết quả thì hệ thống từ chối cập nhật. |

#### Bảng 2.20: Scenario Usecase "Quản lý người dùng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý người dùng |
| 2 | Description | Quản trị viên quản lý tài khoản người dùng trong hệ thống. |
| 3 | Actors | Quản trị viên. |
| 4 | Input | Từ khóa, vai trò, trạng thái và thông tin tài khoản cần xử lý. |
| 5 | Output | Tài khoản được tạo, cập nhật, khóa/mở khóa hoặc xóa nếu hợp lệ. |
| 6 | Basic flow | 1. Quản trị viên mở trang người dùng. <br> 2. Hệ thống hiển thị danh sách tài khoản. <br> 3. Quản trị viên lọc hoặc chọn tài khoản. <br> 4. Quản trị viên thêm/sửa/xóa/khóa tài khoản. <br> 5. Hệ thống kiểm tra và lưu thay đổi. |
| 7 | Alternative flow | Quản trị viên tải lại danh sách người dùng mới nhất. |
| 8 | Exception flow | Email trùng, dữ liệu không hợp lệ hoặc xóa admin cuối cùng thì hệ thống từ chối. |

#### Bảng 2.21: Scenario Usecase "Duyệt hồ sơ công ty"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Duyệt hồ sơ công ty |
| 2 | Description | Quản trị viên kiểm tra hồ sơ công ty và duyệt hoặc từ chối. |
| 3 | Actors | Quản trị viên, nhà tuyển dụng. |
| 4 | Input | Hồ sơ công ty chờ duyệt, quyết định và lý do nếu từ chối. |
| 5 | Output | Trạng thái duyệt công ty được cập nhật. |
| 6 | Basic flow | 1. Quản trị viên mở danh sách công ty chờ duyệt. <br> 2. Quản trị viên xem chi tiết hồ sơ. <br> 3. Quản trị viên duyệt hoặc từ chối. <br> 4. Hệ thống cập nhật trạng thái. |
| 7 | Alternative flow | Quản trị viên yêu cầu nhà tuyển dụng bổ sung thông tin. |
| 8 | Exception flow | Hồ sơ không tồn tại hoặc đã được xử lý thì hệ thống thông báo trạng thái hiện tại. |

#### Bảng 2.22: Scenario Usecase "Duyệt tin tuyển dụng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Duyệt tin tuyển dụng |
| 2 | Description | Quản trị viên kiểm duyệt tin tuyển dụng trước khi công khai. |
| 3 | Actors | Quản trị viên, nhà tuyển dụng. |
| 4 | Input | Tin chờ duyệt, quyết định duyệt/từ chối và lý do nếu có. |
| 5 | Output | Tin được công khai hoặc bị từ chối. |
| 6 | Basic flow | 1. Quản trị viên mở danh sách tin chờ duyệt. <br> 2. Quản trị viên xem chi tiết tin. <br> 3. Quản trị viên duyệt hoặc từ chối. <br> 4. Hệ thống cập nhật trạng thái tin. |
| 7 | Alternative flow | Quản trị viên từ chối và nhập lý do để nhà tuyển dụng chỉnh sửa. |
| 8 | Exception flow | Tin không tồn tại, đã bị xóa hoặc công ty không hợp lệ thì hệ thống từ chối duyệt. |

#### Bảng 2.23: Scenario Usecase "Quản lý danh mục kỹ năng"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Quản lý danh mục kỹ năng |
| 2 | Description | Quản trị viên quản lý danh mục kỹ năng dùng cho tin tuyển dụng và hồ sơ năng lực. |
| 3 | Actors | Quản trị viên. |
| 4 | Input | Tên kỹ năng, nhóm kỹ năng và trạng thái. |
| 5 | Output | Kỹ năng được thêm mới, cập nhật hoặc khóa. |
| 6 | Basic flow | 1. Quản trị viên mở trang kỹ năng. <br> 2. Hệ thống hiển thị danh sách kỹ năng. <br> 3. Quản trị viên thêm/sửa/khóa kỹ năng. <br> 4. Hệ thống kiểm tra dữ liệu. <br> 5. Hệ thống lưu kỹ năng. |
| 7 | Alternative flow | Quản trị viên khóa kỹ năng không còn sử dụng thay vì xóa. |
| 8 | Exception flow | Tên kỹ năng bị trùng hoặc thiếu dữ liệu thì hệ thống báo lỗi. |

#### Bảng 2.24: Scenario Usecase "Duyệt đánh giá công ty"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Duyệt đánh giá công ty |
| 2 | Description | Quản trị viên kiểm duyệt đánh giá công ty trước khi hiển thị công khai. |
| 3 | Actors | Quản trị viên, ứng viên. |
| 4 | Input | Đánh giá công ty chờ duyệt và quyết định xử lý. |
| 5 | Output | Đánh giá được công khai hoặc bị từ chối/ẩn. |
| 6 | Basic flow | 1. Quản trị viên mở trang duyệt đánh giá. <br> 2. Hệ thống hiển thị đánh giá chờ duyệt. <br> 3. Quản trị viên xem nội dung. <br> 4. Quản trị viên duyệt hoặc từ chối. <br> 5. Hệ thống cập nhật trạng thái đánh giá. |
| 7 | Alternative flow | Quản trị viên lọc đánh giá theo trạng thái hoặc công ty. |
| 8 | Exception flow | Đánh giá không tồn tại hoặc đã xử lý thì hệ thống thông báo trạng thái hiện tại. |

#### Bảng 2.25: Scenario Usecase "Xem thống kê hệ thống"

| STT | Thành phần | Nội dung |
|---:|---|---|
| 1 | Usecase name | Xem thống kê hệ thống |
| 2 | Description | Quản trị viên xem số liệu tổng quan để theo dõi hoạt động hệ thống. |
| 3 | Actors | Quản trị viên. |
| 4 | Input | Khoảng thời gian hoặc bộ lọc thống kê nếu có. |
| 5 | Output | Số liệu về người dùng, công ty, tin tuyển dụng, hồ sơ ứng tuyển và dữ liệu cần duyệt. |
| 6 | Basic flow | 1. Quản trị viên mở dashboard quản trị. <br> 2. Hệ thống tổng hợp dữ liệu nghiệp vụ. <br> 3. Hệ thống hiển thị chỉ số và biểu đồ. <br> 4. Quản trị viên xem số liệu. |
| 7 | Alternative flow | Quản trị viên thay đổi bộ lọc hoặc khoảng thời gian. |
| 8 | Exception flow | Dữ liệu thống kê tải thất bại thì hệ thống thông báo lỗi và cho phép tải lại. |

### 2.2.4. Liên Kết Sơ Đồ Với Scenario

| Nhóm sơ đồ | Vai trò trong báo cáo | Danh mục |
|---|---|---|
| Usecase | Xác định actor, chức năng chính và phạm vi hệ thống. | Hình 1.1 đến Hình 1.5 |
| Activity | Trực quan hóa basic flow, alternative flow và exception flow của từng usecase. | Hình 2.1 đến Hình 2.25 |
| Sequence | Mô tả thứ tự tương tác giữa actor, giao diện, controller/service và các collection dữ liệu cụ thể. | Hình 3.1 đến Hình 3.25 |
| Robustness | Chuyển usecase sang mô hình Boundary, Control, Entity. | Hình 4.1 đến Hình 4.25 |
| ERD | Mô tả collection, khóa chính, khóa ngoại và quan hệ dữ liệu lõi. | Hình 5.1 đến Hình 5.3 |
| Bảng dữ liệu | Mô tả trường dữ liệu theo collection MongoDB. | Bảng 5.1 đến Bảng 5.12 |

### 2.2.5. Quy Ước Học Thuật

- Usecase chỉ liệt kê chức năng nghiệp vụ chính, không đưa chi tiết triển khai như API, webhook, AI hoặc socket.
- Activity dùng câu mô tả nghiệp vụ ngắn, có điểm bắt đầu, điểm kết thúc, nhánh điều kiện và fork khi có nhiều dữ liệu được nhập/tải song song.
- Robustness dùng đúng ba nhóm Boundary, Control và Entity để nối yêu cầu với thiết kế; Entity đặt theo đúng tên collection trong hệ thống như `nguoi_dung`, `tin_tuyen_dung`, `ho_so_ung_tuyen`.
- Sequence dùng actor, giao diện, controller/service thật và collection cụ thể để mô tả thứ tự tương tác, không dùng một database MongoDB chung cho mọi nghiệp vụ.
- ERD và bảng dữ liệu dùng kiểu dữ liệu MongoDB/Mongoose để bám sát hệ thống hiện tại.

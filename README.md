# Thanh Tâm Fitness — trang chủ

Trang tĩnh (HTML/CSS/JS thuần), chạy trên Netlify. Bốn ngôn ngữ: Việt, Anh, Trung, Nga.

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ trang và giao diện |
| `i18n.js` | Bảng dịch: khóa là câu tiếng Việt, giá trị là `[English, 中文, Русский]` |
| `app.js` | Chuyển ngôn ngữ, băng chuyền, công cụ BMI, gửi đăng ký |
| `netlify/functions/lead.js` | Nhận đăng ký, tự gửi tin về Zalo OA và Facebook Messenger |
| `netlify/functions/chat.mjs` | Trợ lý AI: nhận câu hỏi của khách và gọi Claude để trả lời |
| `netlify/functions/clips.js` | Lấy clip mới nhất của Trang Facebook để mục clip tự cập nhật |
| `reviews.js` | Danh sách đánh giá của học viên hiển thị trên trang |
| `netlify.toml` | Cấu hình Netlify |

## Sửa nội dung

Sửa câu tiếng Việt trong `index.html`, rồi sửa đúng khóa đó trong `i18n.js`. Khóa phải trùng từng chữ với câu trên trang; câu nào không có trong bảng sẽ hiện tiếng Việt ở mọi ngôn ngữ.

Mở thẳng một ngôn ngữ bằng đường dẫn: `?lang=en`, `?lang=zh`, `?lang=ru`.

## Đăng ký tư vấn chạy thế nào

Khi khách bấm **Đăng ký ngay**, trang gửi cùng lúc tới hai nơi:

1. `/.netlify/functions/lead` — chương trình gửi tin về Zalo và Messenger.
2. Netlify Forms (biểu mẫu tên `dang-ky`) — bản lưu dự phòng, xem trong Netlify → Forms.

Chỉ cần một trong hai nhận được là khách thấy hộp "Đăng ký thành công". Cả hai đều lỗi thì khách được mời nhắn Zalo trực tiếp.

## Biến môi trường (Netlify → Site configuration → Environment variables)

Chưa đặt biến nào thì kênh đó bị bỏ qua, đăng ký vẫn được lưu ở Netlify Forms.

| Biến | Lấy ở đâu |
|---|---|
| `ZALO_OA_ACCESS_TOKEN` | Zalo Official Account → developers.zalo.me → ứng dụng gắn với OA |
| `ZALO_RECIPIENT_USER_ID` | Mã người dùng Zalo của người nhận tin (người này phải bấm Quan tâm OA) |
| `FB_PAGE_ACCESS_TOKEN` | Trang (Page) Facebook → developers.facebook.com → ứng dụng có quyền `pages_messaging` |
| `FB_RECIPIENT_PSID` | Mã PSID của người nhận tin (người này phải từng nhắn cho Trang) |
| `FB_PAGE_ID` | Mã số của Trang Facebook; có biến này cùng `FB_PAGE_ACCESS_TOKEN` thì mục clip tự lấy clip mới |
| `ANTHROPIC_API_KEY` | Khóa Claude API (console.anthropic.com) cho trợ lý AI; chưa có thì trợ lý trả lời bằng mục Hỏi đáp có sẵn |
| `CHAT_MODEL` | Không bắt buộc; mặc định `claude-opus-5-5`. Đặt `claude-haiku-5-5` nếu muốn chi phí thấp hơn |
| `FB_MESSAGE_TAG` | Không bắt buộc; mặc định `ACCOUNT_UPDATE` |

Lưu ý:

- Messenger chỉ gửi tự động được từ **Trang (Page)**, không gửi được từ trang cá nhân.
- Mã truy cập Zalo OA hết hạn sau khoảng một ngày; cần làm mới định kỳ bằng refresh token, phần này chưa có trong mã.
- Phần gọi Zalo và Facebook chưa được chạy thử với tài khoản thật.

## Clip và đánh giá

- Clip: chưa đặt `FB_PAGE_ID` thì trang dùng danh sách clip cố định trong `app.js`. Facebook chỉ cho lấy clip tự động từ Trang (Page), không cho lấy từ trang cá nhân.
- Đánh giá: học viên gửi qua biểu mẫu trên trang (Netlify Forms, biểu mẫu `danh-gia`). Đánh giá không tự hiện; muốn hiện thì chép vào `reviews.js`. Chỉ đăng đánh giá thật, đã được học viên đồng ý.

## Đưa lên Netlify

Trang đang chạy ở hai nơi (từ 17/11/2026):

- **Netlify (trang chính, đủ tính năng):** https://thanhtamfitness.netlify.app/ — dự án `thanhtamfitness`. Dự án này **không nối với GitHub**: nó được tạo bằng cách tải tệp zip lên (Netlify Drop). Mỗi lần sửa trang phải tải lại: chạy `git archive --format=zip -o thanh-tam-fitness.zip HEAD` rồi kéo thả tệp zip vào Netlify → Deploys. Forms đã bật, nhận hai biểu mẫu `dang-ky` và `danh-gia`.
- **GitHub Pages (bản phụ):** https://asianstudioai-creator.github.io/thanh-tam-fitness/ — tự cập nhật khi đẩy mã lên nhánh `main`, nhưng không lưu biểu mẫu và không chạy các chương trình trong `netlify/functions`.

Muốn Netlify tự cập nhật theo GitHub: Netlify → Project configuration → Build & deploy → Link repository, chọn kho này; không cần lệnh build, thư mục xuất bản là thư mục gốc.

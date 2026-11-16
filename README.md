# Thanh Tâm Fitness — trang chủ

Trang tĩnh (HTML/CSS/JS thuần), chạy trên Netlify. Bốn ngôn ngữ: Việt, Anh, Trung, Nga.

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ trang và giao diện |
| `i18n.js` | Bảng dịch: khóa là câu tiếng Việt, giá trị là `[English, 中文, Русский]` |
| `app.js` | Chuyển ngôn ngữ, băng chuyền, công cụ BMI, gửi đăng ký |
| `netlify/functions/lead.js` | Nhận đăng ký, tự gửi tin về Zalo OA và Facebook Messenger |
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
| `FB_MESSAGE_TAG` | Không bắt buộc; mặc định `ACCOUNT_UPDATE` |

Lưu ý:

- Messenger chỉ gửi tự động được từ **Trang (Page)**, không gửi được từ trang cá nhân.
- Mã truy cập Zalo OA hết hạn sau khoảng một ngày; cần làm mới định kỳ bằng refresh token, phần này chưa có trong mã.
- Phần gọi Zalo và Facebook chưa được chạy thử với tài khoản thật.

## Đưa lên Netlify

Netlify → Add new site → Import an existing project → chọn kho GitHub này. Không cần lệnh build; thư mục xuất bản là thư mục gốc. Bật Forms trong Netlify → Forms.

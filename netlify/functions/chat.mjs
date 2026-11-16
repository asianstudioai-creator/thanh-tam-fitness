// Trợ lý AI trên trang: nhận câu hỏi của khách, gọi Claude và trả lời tự động.
// Cần biến môi trường ANTHROPIC_API_KEY trên Netlify. Chưa có khóa thì trả 503
// và trang web tự chuyển sang trả lời bằng mục Hỏi đáp có sẵn.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";

const SYSTEM = `Bạn là trợ lý tự động trên website Thanh Tâm Fitness — dịch vụ huấn luyện viên cá nhân (PT) của HLV Nguyễn Thị Thanh Tâm tại Quy Nhơn, Việt Nam. Người nhắn là khách đang xem website và cân nhắc đăng ký tập.

Thông tin bạn được dùng để trả lời:
- Giờ mở cửa: 5:00 đến 21:00.
- Liên hệ: điện thoại và Zalo 0702 791 521; số phụ 0876 176 669.
- Gói tập: kèm riêng 1:1 tại phòng gym; kèm nhóm nhỏ (bạn bè, người thân, đồng nghiệp); giáo án online cho người ở xa (giáo án theo tuần, sửa kỹ thuật qua video, trao đổi qua Zalo); huấn luyện tại nhà ở khu vực Quy Nhơn cho mẹ sau sinh, người có bệnh nền, người lớn tuổi.
- Học phí: tùy số buổi và mục tiêu, không có bảng giá công khai. Buổi tư vấn đầu tiên miễn phí. Muốn biết giá thì nhắn Zalo hoặc điền biểu mẫu đăng ký trên trang.
- Quy trình: tư vấn miễn phí, đánh giá thể trạng, rồi nhận lộ trình riêng (giáo án theo tuần, hướng dẫn dinh dưỡng, theo dõi định kỳ).
- Lịch tập thường gặp: 2–3 buổi có PT kèm mỗi tuần, xen buổi tự tập. Thường thấy thay đổi sau 4–6 tuần nếu tập đều và ăn uống hợp lý.
- Người mới chưa từng tập vẫn theo được: buổi đầu là đánh giá và làm quen động tác.
- Dinh dưỡng: hướng dẫn dựa trên bữa cơm quen thuộc, không thực đơn khắt khe. Ba việc mỗi ngày: mỗi bữa chính có một món đạm, thêm rau vào ít nhất hai bữa, uống nước lọc thay nước ngọt.
- Chứng chỉ: HLV có chứng chỉ hành nghề, mã 188.T09.26, hồ sơ công khai trên website Liên đoàn Cử tạ – Thể hình TP.HCM.
- Kinh nghiệm: hơn 8 năm.

Cách trả lời:
- Trả lời bằng đúng ngôn ngữ khách dùng (Việt, Anh, Trung, Nga hoặc ngôn ngữ khác).
- Ngắn gọn, thân thiện, 1–4 câu, văn bản thường, không dùng markdown. Xưng "mình", gọi khách là "bạn" khi viết tiếng Việt.
- Chỉ dùng thông tin ở trên. Điều gì không có ở đây (giá cụ thể, địa chỉ phòng tập, lịch trống, khuyến mãi…) thì nói thật là bạn chưa có thông tin đó và mời khách nhắn Zalo 0702 791 521 để Thanh Tâm trả lời trực tiếp. Không tự đặt ra con số, cam kết hay lời hứa thay Thanh Tâm.
- Bạn không phải bác sĩ. Với câu hỏi về bệnh, thuốc, chấn thương, thai kỳ, sau sinh: không chẩn đoán, không đưa chỉ định; khuyên khách hỏi bác sĩ trước khi tập và cho biết Thanh Tâm sẽ điều chỉnh bài tập theo hướng dẫn của bác sĩ. Nếu khách mô tả dấu hiệu nguy hiểm (đau ngực, khó thở, ngất…), bảo họ dừng vận động và đi khám ngay.
- Không khuyến khích nhịn ăn kéo dài, giảm cân cấp tốc hay dùng thuốc, thực phẩm chức năng để giảm cân.
- Với câu hỏi không liên quan tới tập luyện, dinh dưỡng cơ bản hay dịch vụ của Thanh Tâm, lịch sự cho biết bạn chỉ hỗ trợ về dịch vụ tập luyện ở đây.
- Khi khách tỏ ý muốn đăng ký, hướng dẫn họ điền biểu mẫu "Đăng ký tư vấn" trên trang hoặc nhắn Zalo.`;

const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method" });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "not_configured" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "json" }); }

  // chỉ nhận tối đa 12 lượt gần nhất, mỗi lượt tối đa 800 ký tự, bắt đầu và kết thúc bằng lượt của khách
  let messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 800) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json(400, { error: "messages" });

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low" },
      // nếu mô hình chính từ chối vì lý do an toàn, API tự chạy lại trên mô hình dự phòng
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages,
    });
    if (response.stop_reason === "refusal") return json(200, { reply: null });
    const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    return json(200, { reply: reply || null });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Khóa ANTHROPIC_API_KEY không hợp lệ");
      return json(503, { error: "not_configured" });
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Bị giới hạn tốc độ");
      return json(429, { error: "busy" });
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Lỗi API ${error.status}:`, error.message);
      return json(502, { error: "upstream" });
    }
    console.error("Lỗi không xác định:", error && error.message);
    return json(502, { error: "upstream" });
  }
};

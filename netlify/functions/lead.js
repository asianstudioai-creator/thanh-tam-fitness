// Nhận đăng ký từ trang web rồi tự động báo cho Thanh Tâm qua Zalo OA và Facebook Messenger.
// Mọi khóa bí mật đọc từ biến môi trường của Netlify (xem README.md) — không ghi khóa vào mã nguồn.

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

async function post(url, headers, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000)
  });
  let data = {};
  try { data = await r.json(); } catch (e) {}
  return { status: r.status, data };
}

// Zalo Official Account: gửi tin tư vấn tới tài khoản Zalo của chủ trang (người này phải đã quan tâm OA).
async function sendZalo(text) {
  const token = process.env.ZALO_OA_ACCESS_TOKEN, to = process.env.ZALO_RECIPIENT_USER_ID;
  if (!token || !to) return 'not_configured';
  try {
    const { status, data } = await post('https://openapi.zalo.me/v3.0/oa/message/cs', { access_token: token },
      { recipient: { user_id: to }, message: { text } });
    if (status === 200 && data.error === 0) return 'sent';
    console.error('Zalo từ chối:', status, data.error, data.message);
  } catch (e) { console.error('Zalo lỗi kết nối:', e.message); }
  return 'failed';
}

// Facebook Messenger: Trang (Page) gửi tin tới người nhận đã từng nhắn cho Trang (PSID).
async function sendFacebook(text) {
  const token = process.env.FB_PAGE_ACCESS_TOKEN, to = process.env.FB_RECIPIENT_PSID;
  if (!token || !to) return 'not_configured';
  try {
    const { status, data } = await post('https://graph.facebook.com/v21.0/me/messages', { Authorization: 'Bearer ' + token },
      { recipient: { id: to }, messaging_type: 'MESSAGE_TAG', tag: process.env.FB_MESSAGE_TAG || 'ACCOUNT_UPDATE', message: { text } });
    if (status === 200 && data.message_id) return 'sent';
    console.error('Facebook từ chối:', status, data.error && data.error.message);
  } catch (e) { console.error('Facebook lỗi kết nối:', e.message); }
  return 'failed';
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false });
  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false }); }
  if (b['bot-field']) return json(200, { ok: true }); // thư rác: giả vờ thành công

  const name = clean(b.name, 80), phone = clean(b.phone, 20);
  if (name.length < 2 || !/^\+?[\d\s.\-()]{8,20}$/.test(phone)) return json(400, { ok: false });

  const when = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const lines = [
    '🔔 ĐĂNG KÝ TƯ VẤN MỚI',
    'Tên: ' + name,
    'SĐT/Zalo: ' + phone,
    'Mục tiêu: ' + (clean(b.goal, 120) || '—'),
    'Thời gian tập: ' + (clean(b.time, 60) || '—')
  ];
  const note = clean(b.note, 500);
  if (note) lines.push('Ghi chú: ' + note);
  lines.push('Ngôn ngữ khách dùng: ' + (clean(b.lang, 5) || 'vi'), 'Lúc: ' + when);
  const text = lines.join('\n');

  const [zalo, facebook] = await Promise.all([sendZalo(text), sendFacebook(text)]);
  console.log('Kết quả gửi — Zalo:', zalo, '| Facebook:', facebook);
  const sent = zalo === 'sent' || facebook === 'sent';
  return json(sent ? 200 : 502, { ok: sent });
};

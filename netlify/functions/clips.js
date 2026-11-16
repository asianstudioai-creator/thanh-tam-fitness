// Trả về danh sách clip mới nhất của Trang (Page) Facebook để trang web tự cập nhật.
// Cần hai biến môi trường trên Netlify: FB_PAGE_ID và FB_PAGE_ACCESS_TOKEN.
// Chưa đặt biến, hoặc Facebook báo lỗi, thì trả danh sách rỗng và trang web dùng danh sách clip cố định.

const json = (statusCode, body, maxAge) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=' + maxAge },
  body: JSON.stringify(body)
});

exports.handler = async () => {
  const page = process.env.FB_PAGE_ID, token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!page || !token) return json(200, { clips: [] }, 300);
  try {
    const url = 'https://graph.facebook.com/v21.0/' + encodeURIComponent(page) +
      '/videos?fields=id,description,permalink_url,created_time,embeddable&limit=12';
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(8000) });
    const data = await r.json();
    if (!r.ok || !Array.isArray(data.data)) {
      console.error('Facebook từ chối:', r.status, data.error && data.error.message);
      return json(200, { clips: [] }, 300);
    }
    const clips = data.data.filter(v => v && v.id && v.permalink_url).map(v => ({
      id: String(v.id),
      url: v.permalink_url.startsWith('http') ? v.permalink_url : 'https://www.facebook.com' + v.permalink_url,
      // bỏ hashtag và cắt ngắn lời chú thích
      caption: String(v.description || '').replace(/#\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 140),
      embed: v.embeddable !== false,
      time: v.created_time || ''
    }));
    return json(200, { clips }, 900); // trình duyệt giữ kết quả 15 phút
  } catch (e) {
    console.error('Facebook lỗi kết nối:', e.message);
    return json(200, { clips: [] }, 300);
  }
};

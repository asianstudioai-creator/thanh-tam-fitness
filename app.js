(function () {
  'use strict';
  const D = window.I18N || {};
  const LANGS = ['vi', 'en', 'zh', 'ru'];
  let lang = 'vi';

  // t('câu tiếng Việt', {name:'...'}) -> câu theo ngôn ngữ đang chọn
  function t(s, vars) {
    let out = s;
    if (lang !== 'vi') {
      const e = D[s];
      const v = e && e[LANGS.indexOf(lang) - 1];
      if (v) out = v;
    }
    if (vars) for (const k in vars) out = out.split('{' + k + '}').join(vars[k]);
    return out;
  }
  const $ = id => document.getElementById(id);

  // ----- dịch phần chữ tĩnh trên trang -----
  const ATTRS = ['aria-label', 'alt', 'placeholder'];
  const TITLE = document.title;
  function translateStatic() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest('script,style,[data-dyn]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let n;
    while ((n = w.nextNode())) {
      if (n.__vi === undefined) n.__vi = n.nodeValue;
      const raw = n.__vi, key = raw.replace(/\s+/g, ' ').trim();
      if (!key) continue;
      n.nodeValue = lang === 'vi' ? raw : raw.match(/^\s*/)[0] + t(key) + raw.match(/\s*$/)[0];
    }
    document.querySelectorAll('[aria-label],[alt],[placeholder]').forEach(el => {
      if (el.closest('[data-dyn]')) return;
      ATTRS.forEach(a => {
        if (!el.hasAttribute(a)) return;
        el.__viA = el.__viA || {};
        if (!(a in el.__viA)) el.__viA[a] = el.getAttribute(a);
        el.setAttribute(a, t(el.__viA[a]));
      });
    });
    document.title = t(TITLE);
  }

  // ----- menu -----
  const root = document.documentElement, burger = $('burger');
  const setMenu = o => { root.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
  burger.onclick = () => setMenu(!root.classList.contains('open'));
  $('scrim').onclick = () => setMenu(false);
  document.querySelectorAll('.drawer a').forEach(a => (a.onclick = () => setMenu(false)));

  // ----- băng chuyền -----
  const slides = [...document.querySelectorAll('.slide')], dots = $('dots');
  let cur = 0, timer;
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    b.onclick = () => go(i);
    dots.append(b);
  });
  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === cur));
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion:reduce)').matches) timer = setInterval(() => go(cur + 1), 6500);
  }
  $('prev').onclick = () => go(cur - 1);
  $('next').onclick = () => go(cur + 1);
  let sx = null;
  const hero = document.querySelector('.hero');
  hero.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  hero.addEventListener('touchend', e => {
    if (sx === null) return;
    const d = e.changedTouches[0].clientX - sx;
    if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
    sx = null;
  });
  go(0);

  // ----- đồng hồ ngày giờ và trạng thái mở cửa (5:00–21:00, theo giờ Việt Nam) -----
  const TZ = 'Asia/Ho_Chi_Minh', LOCALE = { vi: 'vi-VN', en: 'en-GB', zh: 'zh-CN', ru: 'ru-RU' };
  function vnMinutes() {
    const p = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).formatToParts(new Date());
    const get = k => +p.find(x => x.type === k).value;
    return (get('hour') % 24) * 60 + get('minute');
  }
  function renderClock() {
    const now = new Date(), loc = LOCALE[lang];
    const date = new Intl.DateTimeFormat(loc, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }).format(now);
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: TZ }).format(now);
    $('clock').textContent = date.charAt(0).toUpperCase() + date.slice(1) + ' · ' + time;
  }
  let lastOpen = null;
  function renderStatus() {
    const m = vnMinutes(), open = m >= 300 && m < 1260;
    lastOpen = open;
    $('status').innerHTML = open
      ? '<i class="dot live"></i>' + t('Đang mở cửa · 5:00 – 21:00')
      : '<i class="dot"></i>' + t('Đang nghỉ · mở lại lúc 5:00');
  }
  setInterval(() => { renderClock(); const m = vnMinutes(); if ((m >= 300 && m < 1260) !== lastOpen) renderStatus(); }, 1000);

  // ----- video -----
  const vids = ['LYuBJZWs3dM', 'T26d9EeZcYw', 'WmrZKBK-izA', 'ZUZ0mXQFgvE', '_Kz3dgbsXA4', 'alloaLvZIzQ', 'hoLcqKKcHro', 'ptdWBs7R9-I', 'viwoIGlxAS0', 'wuelfJfQujQ'];
  function renderVideos() {
    $('videos').innerHTML = vids.map((id, i) => {
      const no = String(i + 1).padStart(2, '0'), name = t('Video tham khảo') + ' ' + no;
      return `<a class="card" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
  <div class="art"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${name}" loading="lazy"></div>
  <div class="body"><div class="meta">Video ${no} · YouTube</div><h3>${name}</h3><div class="rule"></div><span class="more">${t('Xem trên YouTube')}</span></div></a>`;
    }).join('');
  }

  // ----- clip học viên (video công khai trên Facebook của Thanh Tâm) -----
  const FB = 'https://www.facebook.com/thanh.nguyen.388949/videos/';
  // phần tử thứ ba: 1 = phát được ngay trên trang; 0 = Facebook không cho nhúng, bấm sẽ mở Facebook
  let clips = [
    ['3353337454864585', 'Chỉ cần mấy chế muốn tập, mấy giờ 15 cô gái cũng xuất hiện hết trọi.', 1],
    ['1792210085336613', 'Đã không tập thì thôi, chớ tập là khéo bị mê.', 1],
    ['1684562006717363', 'Cứ làm tốt nhất trong khả năng, kết quả tốt đến đâu còn tuỳ ý trời 😁', 1],
    ['1908607717142199', 'Khó ở đâu, ta tìm cách giải ở đó ☺️', 1],
    ['1677534527246714', 'Điểm danh đầu tuần nào các trai xinh gái đẹp của tui 😊', 0],
    ['995440633000839', 'Sáng thứ 7 quá trời năng lượng rồi mấy nàng của tui.', 0],
    ['1416310901567958', 'Tag đứa bạn từng rủ rê mấy nàng đi tập vào đây 😄', 0],
    ['1877590463414718', 'Riêng chủ nhật là bao rộng rãi thoáng mát nha!', 0]
  ];
  const playing = new Set();
  const clipUrl = id => { const c = clips.find(x => x[0] === id); return (c && c[3]) || FB + id + '/'; };
  const clipFrame = id => `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clipUrl(id))}&show_text=false&autoplay=true" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" title="Clip"></iframe>`;
  function renderClips() {
    $('clips').innerHTML = clips.map(([id, cap, embed, link], i) => {
      const url = link || FB + id + '/';
      const no = `<span class="no">${String(i + 1).padStart(2, '0')}</span>`;
      const inner = playing.has(id) ? clipFrame(id)
        : embed ? `${no}<button class="play" type="button" aria-label="${t('Xem clip')} ${i + 1}"><i>▶</i>${t('Xem clip')}</button>`
        : `${no}<a class="play" href="${url}" target="_blank" rel="noopener"><i>▶</i>${t('Xem trên Facebook')}</a>`;
      return `<div class="clip"><div class="frame" data-id="${id}">${inner}</div>
  <div class="cap"><p>${cap}</p><a class="more" href="${url}" target="_blank" rel="noopener">${t('Mở trên Facebook')}</a></div></div>`;
    }).join('');
  }
  $('clips').addEventListener('click', e => {
    const b = e.target.closest('button.play');
    if (!b) return;
    const fr = b.parentElement;
    playing.add(fr.dataset.id);
    fr.innerHTML = clipFrame(fr.dataset.id);
  });

  // tự cập nhật: nếu chương trình trên Netlify lấy được clip mới từ Trang Facebook thì thay danh sách cố định ở trên
  fetch('/.netlify/functions/clips').then(r => (r.ok ? r.json() : null)).then(d => {
    const list = d && Array.isArray(d.clips) ? d.clips.filter(c => c && /^\d+$/.test(c.id) && /^https:\/\/(www\.)?facebook\.com\//.test(c.url)) : [];
    if (!list.length) return;
    clips = list.slice(0, 12).map(c => [c.id, esc(c.caption || ''), c.embed ? 1 : 0, c.url]);
    renderClips();
  }).catch(() => {});

  // ----- đánh giá của học viên: danh sách chỉ hiện khi reviews.js có nội dung thật -----
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function renderReviews() {
    const list = (window.REVIEWS || []).filter(r => r && r.name && r.text);
    $('revs').innerHTML = list.map(r => `<figure class="rev">${r.stars ? `<div class="stars" aria-label="${r.stars}/5">${'★'.repeat(Math.max(1, Math.min(5, r.stars)))}</div>` : ''}
  <blockquote>${esc(r.text)}</blockquote><figcaption><cite>${esc(r.name)}${r.detail ? `<small>${esc(r.detail)}</small>` : ''}</cite></figcaption></figure>`).join('');
  }

  // ----- BMI & calo -----
  const calc = $('calc'), res = $('result');
  function renderResult() {
    const f = calc.elements, age = +f.age.value, h = +f.h.value, w = +f.w.value;
    if (!(age >= 18 && age <= 90 && h >= 120 && h <= 220 && w >= 30 && w <= 250)) {
      res.innerHTML = '<p class="hint">' + t('Nhập tuổi (từ 18), chiều cao và cân nặng — kết quả hiện ngay tại đây.') + '</p>';
      return;
    }
    const bmi = w / ((h / 100) ** 2);
    const cls = bmi < 18.5 ? 'Thiếu cân' : bmi < 23 ? 'Bình thường' : bmi < 25 ? 'Thừa cân' : 'Béo phì';
    const bmr = 10 * w + 6.25 * h - 5 * age + (f.sex.value === 'm' ? 5 : -161);
    const tdee = bmr * +f.act.value, target = tdee * (1 + +f.goal.value);
    const r = x => Math.round(x / 10) * 10;
    res.innerHTML = `<div class="hint">${t('BMI của bạn')}</div><div class="v">${bmi.toFixed(1)}</div><div class="c">${t(cls)}</div>
   <div class="k"><div><b>${r(tdee)}</b><span>${t('kcal/ngày để giữ cân')}</span></div><div><b>${r(target)}</b><span>${t('kcal/ngày theo mục tiêu')}</span></div></div>`;
  }
  calc.addEventListener('input', renderResult);

  // ----- đăng ký tư vấn -----
  const lead = $('lead'), send = $('send'), formErr = $('formErr'), ok = $('ok'), okMsg = $('okMsg');
  const rv = $('rvForm'), rvSend = $('rvSend'), rvErr = $('rvErr');
  let busy = false, errKey = '', okData = null, rvBusy = false, rvErrKey = '';
  // gửi cùng lúc tới chương trình báo Zalo/Messenger và tới Netlify Forms (bản dự phòng); một nơi nhận là đủ
  async function postBoth(formName, data) {
    const good = r => { if (!r.ok) throw new Error(r.status); return true; };
    const results = await Promise.allSettled([
      fetch('/.netlify/functions/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(good),
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': formName, 'bot-field': '', ...data }).toString() }).then(good)
    ]);
    return results.some(r => r.status === 'fulfilled');
  }
  function showOk(data) { okData = data; renderForm(); ok.hidden = false; $('okClose').focus(); }
  function renderForm() {
    send.textContent = t(busy ? 'Đang gửi…' : 'Đăng ký ngay');
    send.disabled = busy;
    formErr.textContent = errKey ? t(errKey) : '';
    rvSend.textContent = t(rvBusy ? 'Đang gửi…' : 'Gửi đánh giá');
    rvSend.disabled = rvBusy;
    rvErr.textContent = rvErrKey ? t(rvErrKey) : '';
    if (okData) { $('okT').textContent = t(okData.title); okMsg.textContent = t(okData.msg, okData.vars); }
  }
  function closeOk() { ok.hidden = true; }
  $('okClose').onclick = closeOk;
  ok.addEventListener('click', e => { if (e.target === ok) closeOk(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeOk(); toggleChat(false); } });

  lead.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const f = lead.elements;
    if (f['bot-field'].value) return; // bẫy thư rác
    const name = f.name.value.trim(), phone = f.phone.value.trim();
    if (name.length < 2 || !/^\+?[\d\s.\-()]{8,20}$/.test(phone)) {
      errKey = 'Vui lòng nhập tên và số điện thoại hợp lệ.'; renderForm(); return;
    }
    const data = { name, phone, goal: f.goal.value, time: f.time.value, note: f.note.value.trim(), lang };
    busy = true; errKey = ''; renderForm();
    const sent = await postBoth('dang-ky', data);
    busy = false;
    if (sent) {
      lead.reset();
      showOk({ title: 'Đăng ký thành công!', msg: 'Cảm ơn {name}! Thanh Tâm đã nhận được thông tin và sẽ liên hệ lại với bạn qua số {phone} sớm nhất có thể.', vars: { name, phone } });
    } else {
      errKey = 'Chưa gửi được đăng ký. Bạn vui lòng nhắn Zalo 0702 791 521 hoặc thử lại sau.';
      renderForm();
    }
  });

  // ----- học viên gửi đánh giá -----
  rv.addEventListener('submit', async e => {
    e.preventDefault();
    if (rvBusy) return;
    const f = rv.elements;
    if (f['bot-field'].value) return;
    const name = f.name.value.trim(), text = f.text.value.trim();
    if (name.length < 2 || text.length < 10) { rvErrKey = 'Vui lòng nhập tên và viết ít nhất một câu đánh giá.'; renderForm(); return; }
    if (!f.consent.checked) { rvErrKey = 'Vui lòng đánh dấu đồng ý cho đăng đánh giá.'; renderForm(); return; }
    rvBusy = true; rvErrKey = ''; renderForm();
    const sent = await postBoth('danh-gia', { type: 'review', name, stars: f.stars.value, text, lang });
    rvBusy = false;
    if (sent) {
      rv.reset();
      showOk({ title: 'Cảm ơn bạn đã đánh giá!', msg: 'Đánh giá của bạn đã được gửi tới Thanh Tâm và sẽ hiển thị trên trang sau khi được xem qua.', vars: {} });
    } else {
      rvErrKey = 'Chưa gửi được đánh giá. Bạn vui lòng thử lại sau.';
      renderForm();
    }
  });

  // ----- trợ lý AI -----
  const chatBtn = $('chatBtn'), chatBox = $('chat'), chatLog = $('chatLog'), chatForm = $('chatForm'), chatIn = $('chatIn');
  let chatMsgs = [], chatBusy = false, chatAI = true;
  function bubble(role, text, extra) {
    const d = document.createElement('div');
    d.className = 'b ' + role + (extra ? ' ' + extra : '');
    d.textContent = text;
    chatLog.append(d);
  }
  function renderChat() {
    chatBtn.setAttribute('aria-label', t('Trợ lý AI'));
    $('chatTitle').textContent = t('Trợ lý AI');
    $('chatNote').textContent = t('Câu trả lời do AI tạo tự động và có thể chưa chính xác. Việc quan trọng, bạn hãy hỏi trực tiếp Thanh Tâm.');
    chatIn.placeholder = t('Nhập câu hỏi của bạn…');
    $('chatSend').textContent = t('Gửi');
    chatLog.innerHTML = '';
    bubble('assistant', t('Xin chào! Mình là trợ lý tự động của Thanh Tâm Fitness. Bạn muốn hỏi gì về gói tập, giờ mở cửa hay cách đăng ký?'));
    chatMsgs.forEach(m => bubble(m.role, m.content));
    if (chatBusy) bubble('assistant', '•••', 'wait');
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  function toggleChat(open) {
    chatBox.hidden = !open;
    chatBtn.setAttribute('aria-expanded', open);
    if (open) { renderChat(); chatIn.focus(); }
  }
  chatBtn.onclick = () => toggleChat(chatBox.hidden);
  $('chatClose').onclick = () => toggleChat(false);

  // trả lời dự phòng khi chưa bật AI: tìm trong mục Hỏi đáp trên trang
  const STOP = new Set('có không được là và thì mà của cho với the a an is are do does can i you to of and or in on for my me it what how что как это ли на в и я вы'.split(' '));
  function localAnswer(q) {
    const s = q.toLowerCase();
    if (/giờ|mở cửa|đóng cửa|open|close|hour|часы|работает|открыт|几点|营业|时间/.test(s)) return t('Thanh Tâm mở cửa từ 5:00 đến 21:00.');
    if (/giá|học phí|bao nhiêu tiền|chi phí|price|cost|fee|цена|стоит|сколько|价格|多少钱|费用/.test(s)) return t('Học phí tùy theo số buổi và mục tiêu. Bạn nhắn Zalo 0702 791 521 hoặc điền biểu mẫu đăng ký để nhận báo giá; buổi tư vấn đầu tiên miễn phí.');
    const words = (s.match(/[\p{L}\p{N}]+/gu) || []).filter(w => w.length > 1 && !STOP.has(w));
    let best = null, top = 0;
    document.querySelectorAll('.faq details').forEach(d => {
      const head = d.querySelector('summary').textContent.toLowerCase(), body = d.querySelector('p').textContent;
      let score = 0;
      words.forEach(w => { if (head.includes(w)) score += 2; else if (body.toLowerCase().includes(w)) score += 1; });
      if (score > top) { top = score; best = body; }
    });
    return top >= 4 ? best : t('Mình chưa có sẵn câu trả lời cho câu này. Bạn nhắn Zalo 0702 791 521 để Thanh Tâm trả lời trực tiếp nhé.');
  }
  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const q = chatIn.value.trim();
    if (!q || chatBusy) return;
    chatIn.value = '';
    chatMsgs.push({ role: 'user', content: q.slice(0, 800) });
    chatBusy = true; renderChat();
    let a = null;
    if (chatAI && chatMsgs.length <= 40) {
      try {
        const r = await fetch('/.netlify/functions/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: chatMsgs.slice(-12), lang }) });
        if (r.ok) a = (await r.json()).reply || null;
        else if (r.status !== 429 && r.status !== 502) chatAI = false; // chưa cấu hình AI: dùng câu trả lời có sẵn
      } catch (err) {}
    }
    if (!a) a = localAnswer(q);
    chatMsgs.push({ role: 'assistant', content: a });
    chatBusy = false; renderChat();
  });

  // ----- ngôn ngữ -----
  const sel = $('lang');
  function setLang(l, save) {
    lang = LANGS.includes(l) ? l : 'vi';
    root.lang = lang === 'zh' ? 'zh-Hans' : lang;
    sel.value = lang;
    if (save) { try { localStorage.setItem('lang', lang); } catch (e) {} }
    translateStatic(); renderClock(); renderStatus(); renderVideos(); renderClips(); renderReviews(); renderResult(); renderForm(); if (!chatBox.hidden) renderChat();
  }
  sel.onchange = () => setLang(sel.value, true);
  let first = new URLSearchParams(location.search).get('lang');
  if (!first) { try { first = localStorage.getItem('lang'); } catch (e) {} }
  if (!first) {
    const nav = (navigator.language || 'vi').toLowerCase();
    first = nav.startsWith('zh') ? 'zh' : nav.startsWith('ru') ? 'ru' : nav.startsWith('en') ? 'en' : 'vi';
  }
  setLang(first, false);

  $('yr').textContent = new Date().getFullYear();
})();

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

  // ----- trạng thái mở cửa (5:30–21:00) -----
  function renderStatus() {
    const d = new Date(), m = d.getHours() * 60 + d.getMinutes(), open = m >= 330 && m < 1260;
    $('status').innerHTML = open
      ? '<i class="dot live"></i>' + t('Đang nhận lịch · đến 21:00')
      : '<i class="dot"></i>' + t('Đang nghỉ · mở lại lúc 5:30');
  }

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
  const clips = [
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
  const clipFrame = id => `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(FB + id + '/')}&show_text=false&autoplay=true" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" title="Clip"></iframe>`;
  function renderClips() {
    $('clips').innerHTML = clips.map(([id, cap, embed], i) => {
      const no = `<span class="no">${String(i + 1).padStart(2, '0')}</span>`;
      const inner = playing.has(id) ? clipFrame(id)
        : embed ? `${no}<button class="play" type="button" aria-label="${t('Xem clip')} ${i + 1}"><i>▶</i>${t('Xem clip')}</button>`
        : `${no}<a class="play" href="${FB + id}/" target="_blank" rel="noopener"><i>▶</i>${t('Xem trên Facebook')}</a>`;
      return `<div class="clip"><div class="frame" data-id="${id}">${inner}</div>
  <div class="cap"><p>${cap}</p><a class="more" href="${FB + id}/" target="_blank" rel="noopener">${t('Mở trên Facebook')}</a></div></div>`;
    }).join('');
  }
  $('clips').addEventListener('click', e => {
    const b = e.target.closest('button.play');
    if (!b) return;
    const fr = b.parentElement;
    playing.add(fr.dataset.id);
    fr.innerHTML = clipFrame(fr.dataset.id);
  });

  // ----- đánh giá của học viên: chỉ hiện khi reviews.js có nội dung thật -----
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderReviews() {
    const list = (window.REVIEWS || []).filter(r => r && r.name && r.text);
    $('reviews').hidden = !list.length;
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
  let busy = false, errKey = '', okData = null;
  function renderForm() {
    send.textContent = t(busy ? 'Đang gửi…' : 'Đăng ký ngay');
    send.disabled = busy;
    formErr.textContent = errKey ? t(errKey) : '';
    if (okData) okMsg.textContent = t('Cảm ơn {name}! Thanh Tâm đã nhận được thông tin và sẽ liên hệ lại với bạn qua số {phone} sớm nhất có thể.', okData);
  }
  function closeOk() { ok.hidden = true; }
  $('okClose').onclick = closeOk;
  ok.addEventListener('click', e => { if (e.target === ok) closeOk(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeOk(); } });

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
    const good = r => { if (!r.ok) throw new Error(r.status); return true; };
    // 1) chương trình tự động gửi Zalo + Messenger   2) lưu vào Netlify Forms làm bản dự phòng
    const results = await Promise.allSettled([
      fetch('/.netlify/functions/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(good),
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'dang-ky', 'bot-field': '', ...data }).toString() }).then(good)
    ]);
    busy = false;
    if (results.some(r => r.status === 'fulfilled')) {
      okData = { name, phone };
      lead.reset();
      renderForm();
      ok.hidden = false;
      $('okClose').focus();
    } else {
      errKey = 'Chưa gửi được đăng ký. Bạn vui lòng nhắn Zalo 0702 791 521 hoặc thử lại sau.';
      renderForm();
    }
  });

  // ----- ngôn ngữ -----
  const sel = $('lang');
  function setLang(l, save) {
    lang = LANGS.includes(l) ? l : 'vi';
    root.lang = lang === 'zh' ? 'zh-Hans' : lang;
    sel.value = lang;
    if (save) { try { localStorage.setItem('lang', lang); } catch (e) {} }
    translateStatic(); renderStatus(); renderVideos(); renderClips(); renderReviews(); renderResult(); renderForm();
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

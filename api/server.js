const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Supabase ────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // service role key（サーバー専用・公開しない）
);

// ── CORS ────────────────────────────────────────────────────
// ALLOWED_ORIGINS に GitHub Pages の URL をカンマ区切りで設定
// 例: https://shisuto3141.github.io,http://localhost:5500
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // origin なし（curl 等）or リストに含まれていれば許可
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} is not allowed`));
    }
  }
}));

app.use(express.json());

// ── ヘルスチェック ───────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 訪問記録 ────────────────────────────────────────────────
app.post('/api/visit', async (req, res) => {
  try {
    // IP アドレスを取得（Railway は X-Forwarded-For を付与）
    const ip = (req.headers['x-forwarded-for'] || '')
                 .split(',')[0]
                 .trim() || req.socket.remoteAddress || 'unknown';

    const { referrer, user_agent, screen_width, screen_height, page_url } = req.body;

    // ── IP ジオロケーション（ip-api.com 無料枠: 45 req/min）──
    let country = null, city = null;
    const isPrivate = !ip || ip === 'unknown'
                   || ip.startsWith('127.')
                   || ip.startsWith('192.168.')
                   || ip.startsWith('10.')
                   || ip === '::1';

    if (!isPrivate) {
      try {
        const geoRes = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,city`
        );
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          country = geo.country;
          city    = geo.city;
        }
      } catch (_) {
        // ジオロケーション失敗は無視して続行
      }
    }

    // ── Supabase に INSERT ──────────────────────────────────
    const { error } = await supabase.from('visitors').insert({
      ip_address:   ip,
      country,
      city,
      referrer:     referrer     || null,
      user_agent:   user_agent   || null,
      screen_width: screen_width || null,
      screen_height:screen_height|| null,
      page_url:     page_url     || null,
      // visited_at は Supabase 側で now() がデフォルト設定済み
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('[visit error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Visitor API running on port ${PORT}`);
});

const express = require('express');
const cors    = require('cors');
const { DynamoDBClient }          = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── DynamoDB クライアント ────────────────────────────────────
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const dynamo = DynamoDBDocumentClient.from(ddbClient);
const TABLE  = process.env.DYNAMODB_TABLE_NAME || 'visitors';

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} is not allowed`));
    }
  }
}));

app.use(express.json());

// ── ヘルスチェック ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 訪問記録 ─────────────────────────────────────────────────
app.post('/api/visit', async (req, res) => {
  try {
    // IP アドレス取得（Railway は X-Forwarded-For を付与）
    const ip = (req.headers['x-forwarded-for'] || '')
                 .split(',')[0]
                 .trim() || req.socket.remoteAddress || 'unknown';

    const { referrer, user_agent, screen_width, screen_height, page_url } = req.body;

    // ── IP ジオロケーション（ip-api.com 無料枠）──────────────
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
      } catch (_) { /* ジオロケーション失敗は無視 */ }
    }

    // ── DynamoDB に PUT ──────────────────────────────────────
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        id:            randomUUID(),           // Partition Key
        visited_at:    new Date().toISOString(),
        ip_address:    ip,
        country:       country  ?? 'unknown',
        city:          city     ?? 'unknown',
        referrer:      referrer     || null,
        user_agent:    user_agent   || null,
        screen_width:  screen_width  ? Number(screen_width)  : null,
        screen_height: screen_height ? Number(screen_height) : null,
        page_url:      page_url     || null,
      },
    }));

    res.json({ success: true });
  } catch (err) {
    console.error('[visit error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Visitor API running on port ${PORT}`);
});

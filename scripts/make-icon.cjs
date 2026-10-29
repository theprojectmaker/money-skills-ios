// Draws the app icon (three candles on a dark tile) with no image library.
const zlib = require('zlib'), fs = require('fs');
const N = 1024, px = Buffer.alloc(N * N * 3);
const fill = (x0, y0, x1, y1, [r, g, b]) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * N + x) * 3; px[i] = r; px[i + 1] = g; px[i + 2] = b; } };
fill(0, 0, N, N, [19, 23, 34]);
const up = [38, 166, 154], dn = [239, 83, 80];
const candle = (cx, top, bot, wt, wb, c) => { fill(cx - 12, wt, cx + 12, wb, c); fill(cx - 70, top, cx + 70, bot, c); };
candle(250, 520, 760, 440, 820, dn);
candle(512, 360, 640, 280, 700, up);
candle(774, 200, 520, 130, 580, up);
const raw = Buffer.alloc((N * 3 + 1) * N);
for (let y = 0; y < N; y++) { raw[y * (N * 3 + 1)] = 0; px.copy(raw, y * (N * 3 + 1) + 1, y * N * 3, (y + 1) * N * 3); }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync('assets/icon.png', Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));

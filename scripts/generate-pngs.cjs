const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPNG(width, height, isMaskable = false) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Uncompressed raster lines
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46;
  const cornerRadius = width * 0.25;

  // Maskable scale has extra safe zone padding
  const heartScale = isMaskable ? width * 0.28 : width * 0.36;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base gradient: Pink (#FF4081) to Dark Rose (#C2185B)
      const gradT = (x + y) / (width + height);
      const bgR = Math.round(255 - gradT * 60);
      const bgG = Math.round(64 - gradT * 40);
      const bgB = Math.round(129 - gradT * 38);

      let alpha = 255;
      if (!isMaskable) {
        // Rounded rectangle mask
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const qx = cx - cornerRadius;
        const qy = cy - cornerRadius;
        if (dx > qx && dy > qy) {
          const dist = Math.hypot(dx - qx, dy - qy);
          if (dist > cornerRadius) {
            alpha = Math.max(0, Math.min(255, Math.round((cornerRadius - dist + 1) * 255)));
          }
        }
      }

      // Heart coordinate math
      // Invert y so top is up; shift center slightly for heart visual balance
      const hx = (x - cx) / heartScale;
      const hy = -(y - cy - (isMaskable ? 0 : width * 0.03)) / heartScale + 0.15;

      // Heart implicit function: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const a = hx * hx + hy * hy - 1;
      const f = a * a * a - hx * hx * (hy * hy * hy);

      if (f <= 0) {
        // Inside heart: White color (#FFFFFF)
        // With small pink droplet in center
        const dropX = (x - cx) / (heartScale * 0.35);
        const dropY = -(y - (cy + (isMaskable ? width * 0.05 : width * 0.02))) / (heartScale * 0.35);
        // Tear drop equation: x^2 + (y - sqrt(|x|))^2
        const dropDist = Math.hypot(dropX, dropY);
        const isDroplet = (dropY < 0.8 && dropY > -0.8 && Math.abs(dropX) < 0.6 && (dropX*dropX + Math.pow(dropY + 0.2, 2) < 0.35));

        if (isDroplet) {
          rawData[pxOffset] = 233;     // R: #E91E63
          rawData[pxOffset + 1] = 30;  // G
          rawData[pxOffset + 2] = 99;  // B
          rawData[pxOffset + 3] = alpha;
        } else {
          rawData[pxOffset] = 255;     // R: White
          rawData[pxOffset + 1] = 255; // G
          rawData[pxOffset + 2] = 255; // B
          rawData[pxOffset + 3] = alpha;
        }
      } else {
        // Background
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = alpha;
      }
    }
  }

  // Compress
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
console.log('Generated pwa-192x192.png');

// 2. 512x512 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
console.log('Generated pwa-512x512.png');

// 3. 512x512 maskable PNG (with full-bleed background & safe zone)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
console.log('Generated pwa-maskable-512x512.png');

// 4. apple-touch-icon.png 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
console.log('Generated apple-touch-icon.png');

// 5. favicon-32x32.png
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), createPNG(32, 32, false));
console.log('Generated favicon-32x32.png');

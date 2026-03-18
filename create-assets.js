const fs = require('fs');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuffer = Buffer.from(type);
    const lenBuffer = Buffer.alloc(4);
    lenBuffer.writeUInt32BE(data.length, 0);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([lenBuffer, typeBuffer, data, crcBuffer]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data
  const rawData = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), idat, iend]);
}

// Draw a simple gold ring/circle on black background
function createIconPNG(size) {
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuffer = Buffer.from(type);
    const lenBuffer = Buffer.alloc(4);
    lenBuffer.writeUInt32BE(data.length, 0);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([lenBuffer, typeBuffer, data, crcBuffer]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.42, innerR = size * 0.30;

  const rawData = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    rawData[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      if (dist <= outerR && dist >= innerR) {
        rawData[offset] = 196; rawData[offset + 1] = 160; rawData[offset + 2] = 0;
      } else {
        rawData[offset] = 0; rawData[offset + 1] = 0; rawData[offset + 2] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

fs.writeFileSync(`${assetsDir}/icon.png`, createIconPNG(1024));
fs.writeFileSync(`${assetsDir}/adaptive-icon.png`, createIconPNG(1024));
fs.writeFileSync(`${assetsDir}/notification-icon.png`, createIconPNG(96));
fs.writeFileSync(`${assetsDir}/splash.png`, createPNG(1284, 2778, 0, 0, 0));

console.log('Assets created successfully!');

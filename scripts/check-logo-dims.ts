
import fs from 'fs';

// Read the first few bytes of the PNG to get dimensions
const fd = fs.openSync('public/logo.png', 'r');
const buffer = Buffer.alloc(24);
fs.readSync(fd, buffer, 0, 24, 0);
fs.closeSync(fd);

// PNG signature is 8 bytes. IHDR chunk starts at byte 8.
// Width is at byte 16 (4 bytes), Height is at byte 20 (4 bytes).
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);

console.log(`Dimensions: ${width}x${height}`);

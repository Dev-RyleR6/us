import fs from 'node:fs/promises';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '../.tools/node_modules/@napi-rs/canvas/index.js';
Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
const { getDocument } = await import('../.tools/node_modules/pdfjs-dist/legacy/build/pdf.mjs');
const task = getDocument({ data: new Uint8Array(await fs.readFile('assets/pdf/_3rd.pdf')), useSystemFonts: true });
const pdf = await task.promise;
if (pdf.numPages !== 11) throw new Error(`Expected 11 pages, got ${pdf.numPages}`);
await fs.mkdir('assets/images/third', { recursive: true });
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const base = page.getViewport({ scale: 1 });
  if (Math.abs(base.width - base.height) > 1) throw new Error('Expected square page');
  const viewport = page.getViewport({ scale: 1500 / base.width });
  const canvas = createCanvas(1500, 1500);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  const path = `assets/images/third/page-${String(i).padStart(2, '0')}.png`;
  await fs.writeFile(path, canvas.toBuffer('image/png'));
  const thumbnail = createCanvas(120, 120);
  thumbnail.getContext('2d').drawImage(canvas, 0, 0, 120, 120);
  await fs.writeFile(path.replace('page-', 'thumb-'), thumbnail.toBuffer('image/png'));
  const text = (await page.getTextContent()).items.map(item => item.str).join(' ');
  console.log(JSON.stringify({ page: i, size: '1500x1500', text }));
}
await task.destroy();

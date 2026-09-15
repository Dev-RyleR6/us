import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {parseGIF,decompressFrame}=require('../.tools/node_modules/gifuct-js');
const {createCanvas,loadImage,ImageData}=require('../.tools/node_modules/@napi-rs/canvas');
const {config,timeline,draw}=require('../assets/js/showcase.js');
const metadata=require('../assets/js/data/showcase-exports.js');
const images=Object.fromEntries(await Promise.all(config.presets.all.pages.map(async n=>[n,await loadImage(`assets/images/third/page-${String(n).padStart(2,'0')}.png`)])));
const canvas=createCanvas(640,640),ctx=canvas.getContext('2d');
const expected=createCanvas(640,640),expectedCtx=expected.getContext('2d');
const averageDifference=(a,b)=>{let sum=0;for(let p=0;p<a.length;p+=4)for(let c=0;c<3;c++)sum+=Math.abs(a[p+c]-b[p+c]);return sum/(640*640*3);};
for(const [id,preset] of Object.entries(config.presets)) {
 const bytes=await fs.readFile(preset.gifUrl),gif=parseGIF(bytes),meta=metadata[id],scenes=timeline(id);
 const frames=gif.frames.filter(f=>f.image),duration=id==='all'?66:20;
 assert.equal(gif.lsd.width,640);assert.equal(gif.lsd.height,640);
 assert.equal(meta.duration,duration);assert.equal(meta.bytes,bytes.length);assert.ok(bytes.length<10_000_000);
 assert.equal(frames.length,duration*meta.fps);assert.equal(frames.reduce((sum,f)=>sum+f.gce.delay*10,0),duration*1000);
 const loop=bytes.indexOf(Buffer.from('NETSCAPE2.0'));assert.ok(loop>=0);
 assert.deepEqual([...bytes.subarray(loop+11,loop+16)],[3,1,0,0,0]);
 assert.deepEqual(scenes.filter(s=>s.page).map(s=>s.page),id==='all'?[1,2,3,4,5,6,7,8,9,10,11]:[1,3,8,10,11]);
 // Check every hold and every transition in the actual compressed artifact.
 const samples=new Set([0,frames.length-1,...scenes.flatMap(s=>[Math.round((s.start+.5)*meta.fps),Math.round((s.end-.35)*meta.fps)])]);
 const composed=new Uint8ClampedArray(640*640*4);let first;
 for(let f=0;f<frames.length;f++) {
  const decoded=decompressFrame(frames[f],gif.gct,true);assert.equal(decoded.disposalType,1);
  for(let p=0;p<decoded.patch.length;p+=4)if(decoded.patch[p+3])composed.set(decoded.patch.subarray(p,p+4),p);
  if(samples.has(f)) {
   draw(expectedCtx,images,scenes,f/meta.fps);
   const target=expectedCtx.getImageData(0,0,640,640).data;
   assert.ok(averageDifference(target,composed)<13,`${id} frame ${f} differs from source`);
   ctx.putImageData(new ImageData(composed.slice(),640,640),0,0);
   await fs.writeFile(`artifacts/gif-${id}-${f}.png`,canvas.toBuffer('image/png'));
  }
  if(f===0)first=composed.slice();
 }
 assert.ok(averageDifference(first,composed)<10,`${id} has an abrupt loop seam`);
 // All page artwork remains still during its reading hold, and reduced motion never blends.
 for(const scene of scenes) {
  draw(expectedCtx,images,scenes,scene.start+.25);const a=expectedCtx.getImageData(0,0,640,640).data;
  draw(expectedCtx,images,scenes,scene.start+1);assert.equal(averageDifference(a,expectedCtx.getImageData(0,0,640,640).data),0);
  draw(expectedCtx,images,scenes,scene.end-.1,true);assert.equal(averageDifference(a,expectedCtx.getImageData(0,0,640,640).data),0);
 }
 console.log(`PASS ${id}: ${duration}s, ${meta.fps} fps, ${(bytes.length/1e6).toFixed(2)} MB; every scene/transition decoded, loop seam, still holds and reduced motion`);
}

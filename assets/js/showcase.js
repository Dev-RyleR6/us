/* Original artwork only. Shared by the live player and local GIF generator. */
(function(root) {
  'use strict';
  const config = {
    size:640, fps:12, transition:0.6,
    colors:{background:'#11100f',red:'#a73538',paper:'#eee9df'},
    presets:{
      highlights:{label:'Highlights',pages:[1,3,8,10,11],secondsPerPage:4,gifUrl:'assets/exports/loveys-mini-showcase.gif'},
      all:{label:'All Pages',pages:Array.from({length:11},(_,i)=>i+1),secondsPerPage:6,gifUrl:'assets/exports/loveys-full-story.gif'},
    },
    transitions:['stack','dissolve','photo','photo','dissolve','stack','photo','stack','stack','dissolve','dissolve'],
  };
  function timeline(id) {
    const preset=config.presets[id];
    if(!preset) throw new Error('Unknown preset');
    return preset.pages.map((page,i)=>({kind:'page',page,label:`Page ${page}`,transition:config.transitions[page-1],duration:preset.secondsPerPage,start:i*preset.secondsPerPage,end:(i+1)*preset.secondsPerPage}));
  }
  function locate(scenes,seconds) {
    const duration=scenes[scenes.length-1].end,time=((seconds%duration)+duration)%duration;
    const index=scenes.findIndex(s=>time<s.end),scene=scenes[index];
    return {index,time,scene,duration,progress:(time-scene.start)/scene.duration};
  }
  function draw(ctx,images,scenes,seconds,reducedMotion=false) {
    const state=locate(scenes,seconds);
    const raw=reducedMotion?0:Math.max(0,(state.time-state.scene.end+config.transition)/config.transition);
    const blend=1-Math.pow(1-raw,3);
    ctx.save();ctx.fillStyle=config.colors.background;ctx.fillRect(0,0,640,640);
    const paint=(scene,alpha,incoming,amount)=>{
      if(!images[scene.page]) return;
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(320,320);
      if(!reducedMotion && amount) {
        if(scene.transition==='stack') ctx.translate((incoming?12:-8)*amount,0);
        if(scene.transition==='photo') {ctx.translate(0,(incoming?12:-6)*amount);ctx.rotate((incoming?1:-0.5)*Math.PI/180*amount);}
      }
      ctx.drawImage(images[scene.page],-302,-302,604,604);ctx.restore();
    };
    paint(state.scene,1-blend,false,blend);
    if(blend>0) paint(scenes[(state.index+1)%scenes.length],blend,true,1-blend);
    ctx.restore();return state;
  }
  root.ScrapbookShowcase={config,timeline,locate,draw};
  if(typeof module!=='undefined') module.exports=root.ScrapbookShowcase;
})(typeof window==='undefined'?globalThis:window);
